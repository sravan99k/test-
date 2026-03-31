import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/integrations/firebase';
import { getSecondaryAuth } from '@/services/novoAdminService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
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

export function useTeacherCSVImport() {
    const { toast } = useToast();
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0, status: '' });
    const [importErrors, setImportErrors] = useState<ImportError[]>([]);

    const importCSV = async (file: File, onSuccess?: () => void) => {
        if (!auth.currentUser) return;
        setIsImporting(true);
        setImportProgress({ current: 0, total: 0, status: 'Initializing...' });

        try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) throw new Error('User document not found');

            const userData = userDocSnap.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;
            const schoolPath = isIndependent
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            const text = await file.text();
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length < 2) throw new Error('CSV has no data rows');

            const parseCSVLine = (line: string) => {
                // Simplified parser
                return line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
            };

            const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s\-\/]+/g, ''));
            const rows = lines.slice(1);

            const secondaryAuth = getSecondaryAuth();
            let successCount = 0;
            let failCount = 0;
            const errors: ImportError[] = [];

            setImportProgress({ current: 0, total: rows.length, status: 'Starting...' });

            for (let i = 0; i < rows.length; i++) {
                setImportProgress({ current: i + 1, total: rows.length, status: `Importing ${i + 1}...` });
                try {
                    const values = parseCSVLine(rows[i]);
                    const r: any = {};
                    headers.forEach((h, idx) => r[h] = values[idx] || '');

                    // Enhanced field validation
                    if (!r.email) {
                        errors.push({
                            row: i + 2, // +2 because CSV rows are 1-indexed and header is row 1
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

                    // Name validation
                    const firstName = r.firstname || r.name?.split(' ')[0] || '';
                    const lastName = r.lastname || r.name?.split(' ').slice(1).join(' ') || '';
                    
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

                    const password = r.password || Math.random().toString(36).slice(-8) + 'A1!';
                    const cred = await createUserWithEmailAndPassword(secondaryAuth, r.email, password);

                    const teacherId = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-');

                    const teacherData = {
                        firstName,
                        lastName,
                        name: `${firstName} ${lastName}`,
                        email: r.email,
                        phone: r.phone || '',
                        teacherID: r.teacherid || '',
                        subject: r.subject || 'General',
                        qualification: r.qualification || '',
                        experience: r.experience || '',
                        teacherUserId: cred.user.uid,
                        schoolId,
                        status: 'active',
                        createdAt: serverTimestamp()
                    };

                    await setDoc(doc(db, `${schoolPath}/teachers`, teacherId), teacherData);
                    await setDoc(doc(db, 'users', cred.user.uid), {
                        ...teacherData,
                        role: 'teacher',
                        slug: `teacher-${teacherId}`,
                        teacherId,
                        organizationId: isIndependent ? null : organizationId,
                        parentAdminId: adminId,
                        isIndependent
                    });

                    successCount++;
                } catch (e: any) {
                    console.error(e);
                    const values = parseCSVLine(rows[i]);
                    const r: any = {};
                    headers.forEach((h, idx) => r[h] = values[idx] || '');
                    
                    errors.push({
                        row: i + 2,
                        field: 'general',
                        error: e.message || 'Unknown error occurred',
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
                    description: `Successfully imported ${successCount} teachers. ${failCount} rows had errors.`,
                    variant: 'default'
                });
            } else {
                toast({ 
                    title: 'Import Successful', 
                    description: `Successfully imported ${successCount} teachers.` 
                });
            }
            onSuccess?.();
        } catch (e: any) {
            toast({ title: 'Import Failed', description: e.message, variant: 'destructive' });
        } finally {
            setIsImporting(false);
        }
    };

    return { importCSV, isImporting, importProgress, importErrors };
}
