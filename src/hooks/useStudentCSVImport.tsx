import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/integrations/firebase';
import { getSecondaryAuth } from '@/services/novoAdminService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { validateEmail } from '@/utils/emailValidation';

export interface ImportProgress {
    current: number;
    total: number;
    status: string;
}

export interface ImportError {
    row: number;
    field: string;
    error: string;
    data: any;
}

export function useStudentCSVImport() {
    const { toast } = useToast();
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0, status: '' });
    const [importErrors, setImportErrors] = useState<ImportError[]>([]);

    const importCSV = async (file: File, onSuccess?: () => void) => {
        if (!auth.currentUser) {
            toast({ title: 'Error', description: 'Not authenticated.', variant: 'destructive' });
            return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast({ title: 'Unsupported file', description: 'Please select a .csv file.', variant: 'destructive' });
            return;
        }

        setIsImporting(true);
        setImportProgress({ current: 0, total: 0, status: 'Initializing...' });

        try {
            // 1. Get School Context
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) throw new Error('User document not found');

            const userData = userDocSnap.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

            if (!schoolId || !adminId) throw new Error('Missing school configuration');

            const schoolPath = isIndependent
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            // 2. Parse CSV
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length < 2) throw new Error('CSV has no data rows');

            const parseCSVLine = (line: string): string[] => {
                const result: string[] = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') inQuotes = !inQuotes;
                    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
                    else current += char;
                }
                result.push(current.trim());
                return result;
            };

            const rawHeaders = parseCSVLine(lines[0]).map(h =>
                h.replace(/^"|"$/g, '').toLowerCase().replace(/[\s\-\/]+/g, '')
            );

            const rows = lines.slice(1).map(line => {
                const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, ''));
                const obj: Record<string, string> = {};
                rawHeaders.forEach((h, i) => { obj[h] = values[i] || ''; });
                return obj;
            });

            // 3. Pre-fetch Teachers for mapping
            const teachersSnapshot = await getDocs(collection(db, `${schoolPath}/teachers`));
            const teacherNameToId = new Map<string, string>();
            teachersSnapshot.docs.forEach(doc => {
                const d = doc.data();
                const name = d.name || `${d.firstName} ${d.lastName}`;
                teacherNameToId.set(name.toLowerCase(), doc.id);
            });

            // 4. Process Rows
            const secondaryAuth = getSecondaryAuth();
            let successCount = 0;
            let failCount = 0;
            const errors: ImportError[] = [];

            setImportProgress({ current: 0, total: rows.length, status: 'Starting import...' });

            for (let i = 0; i < rows.length; i++) {
                const r = rows[i];
                setImportProgress({ current: i + 1, total: rows.length, status: `Importing row ${i + 1}...` });

                try {
                    // Enhanced field validation
                    let firstName = r.firstname || '';
                    let lastName = r.lastname || '';
                    if (r.fullname) {
                        const parts = r.fullname.trim().split(/\s+/);
                        firstName = parts[0];
                        lastName = parts.slice(1).join(' ') || parts[0];
                    }

                    // Validate required fields
                    if (!firstName.trim() || !lastName.trim()) {
                        errors.push({
                            row: i + 2,
                            field: 'name',
                            error: 'Both first name and last name are required',
                            data: r
                        });
                        failCount++;
                        continue;
                    }

                    if (!r.email || !r.email.trim()) {
                        errors.push({
                            row: i + 2,
                            field: 'email',
                            error: 'Email is required',
                            data: r
                        });
                        failCount++;
                        continue;
                    }

                    // Enhanced email validation
                    const emailValidation = validateEmail(r.email);
                    if (!emailValidation.isValid) {
                        errors.push({
                            row: i + 2,
                            field: 'email',
                            error: emailValidation.error || 'Invalid email format',
                            data: r
                        });
                        failCount++;
                        continue;
                    }

                    if (!r.grade || !r.grade.trim()) {
                        errors.push({
                            row: i + 2,
                            field: 'grade',
                            error: 'Grade is required',
                            data: r
                        });
                        failCount++;
                        continue;
                    }

                    const studentId = r.studentid || r.id || '';
                    const studentSlug = studentId || `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-');

                    // Check existence
                    const studentRef = doc(db, `${schoolPath}/students`, studentSlug);
                    const studentSnap = await getDoc(studentRef);
                    if (studentSnap.exists()) {
                        errors.push({
                            row: i + 2,
                            field: 'general',
                            error: 'Student with this ID already exists',
                            data: r
                        });
                        failCount++;
                        continue;
                    }

                    // Create Auth
                    const password = r.password || Math.random().toString(36).slice(-8) + 'A1!';
                    const cred = await createUserWithEmailAndPassword(secondaryAuth, r.email, password);

                    // Resolve Teacher
                    let teacherId = '';
                    if (r.assignedto || r.teacherid) {
                        const lookup = (r.assignedto || r.teacherid).toLowerCase();
                        teacherId = teacherNameToId.get(lookup) || '';
                    }

                    // Firestore Writes (Sequential for safety, could be batched)
                    const studentData = {
                        firstName,
                        lastName,
                        name: `${firstName} ${lastName}`,
                        email: r.email,
                        phone: r.phone || '',
                        grade: r.grade,
                        section: r.section || 'A',
                        studentUserId: cred.user.uid,
                        schoolId,
                        status: 'active',
                        createdAt: serverTimestamp()
                    };

                    await setDoc(studentRef, studentData);

                    // Grade Index
                    await setDoc(doc(db, `${schoolPath}/grades/_list/${r.grade}/${r.section || 'A'}/students`, studentSlug), {
                        addedAt: serverTimestamp()
                    });

                    // Teacher Assignment
                    if (teacherId) {
                        await setDoc(doc(db, `${schoolPath}/assignments/_list/teachers/${teacherId}/students`, studentSlug), {
                            assignedAt: serverTimestamp()
                        });
                    }

                    // User Profile
                    await setDoc(doc(db, 'users', cred.user.uid), {
                        ...studentData,
                        role: 'student',
                        slug: `student-${studentSlug}`,
                        organizationId: isIndependent ? null : organizationId,
                        parentAdminId: adminId,
                        isIndependent
                    });

                    successCount++;

                } catch (err: any) {
                    console.error(`Row ${i} failed:`, err);
                    errors.push({
                        row: i + 2,
                        field: 'general',
                        error: err.message || 'Unknown error occurred',
                        data: r
                    });
                    failCount++;
                }
            }

            setImportErrors(errors);

            // Enhanced success/failure reporting
            if (errors.length > 0) {
                toast({ 
                    title: 'Import Complete with Errors', 
                    description: `Successfully imported ${successCount} students. ${failCount} rows had errors.`,
                    variant: 'default'
                });
            } else {
                toast({ 
                    title: 'Import Successful', 
                    description: `Successfully imported ${successCount} students.` 
                });
            }

            onSuccess?.();

        } catch (err: any) {
            console.error('Import error:', err);
            toast({ title: 'Import Failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsImporting(false);
            setImportProgress({ current: 0, total: 0, status: '' });
        }
    };

    return { importCSV, isImporting, importProgress, importErrors };
}
