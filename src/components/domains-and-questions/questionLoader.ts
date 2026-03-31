export interface MajorAssessmentJson {
  metadata?: any;
  questions?: any[];
  scenarios?: any[];
  generalQuestions?: {
    questions: any[];
  };
}

interface MajorModulesMap {
  [path: string]: () => Promise<any>;
}

interface MiniModulesMap {
  [path: string]: () => Promise<any>;
}

const majorModules: MajorModulesMap = import.meta.glob('./grade-*/phase-*/major.json');

// Mini assessment JSONs are stored per grade/phase and may use either
// {assessmentId}.mini.json or {assessmentId}.json naming conventions
// (e.g. g6-p3-midwinter.mini.json or mini-1-1.json).
const miniModules: MiniModulesMap = import.meta.glob('./grade-*/phase-*/*.json');

export const loadMajorByGradeAndPhase = async (
  grade: string | number,
  phase: number
): Promise<MajorAssessmentJson | null> => {
  const gradeStr = typeof grade === 'string' ? grade.replace(/[^0-9]/g, '') : String(grade);
  if (!gradeStr) return null;

  const key = `./grade-${gradeStr}/phase-${phase}/major.json`;
  const loader = majorModules[key];
  if (!loader) {
    console.warn('[questionLoader] No major.json found for', { grade: gradeStr, phase });
    return null;
  }

  try {
    const mod = await loader();
    const data = (mod && (mod.default ?? mod)) as MajorAssessmentJson;
    return data || null;
  } catch (e) {
    console.error('[questionLoader] Failed to load major.json', { grade: gradeStr, phase }, e);
    return null;
  }
};

export const loadMiniByAssessmentId = async (
  grade: string | number,
  phase: number,
  assessmentId: string
): Promise<MajorAssessmentJson | null> => {
  const gradeStr = typeof grade === 'string' ? grade.replace(/[^0-9]/g, '') : String(grade);
  if (!gradeStr || !assessmentId) return null;

  const basePath = `./grade-${gradeStr}/phase-${phase}/`;
  const candidateKeys = [
    `${basePath}${assessmentId}.mini.json`,
    `${basePath}${assessmentId}.json`,
  ];

  const loaderKey = candidateKeys.find((k) => miniModules[k]);
  const loader = loaderKey ? miniModules[loaderKey] : undefined;
  if (!loader) {
    console.warn('[questionLoader] No mini assessment JSON found for', {
      grade: gradeStr,
      phase,
      assessmentId,
    });
    return null;
  }

  try {
    const mod = await loader();
    const data = (mod && (mod.default ?? mod)) as MajorAssessmentJson;
    return data || null;
  } catch (e) {
    console.error('[questionLoader] Failed to load mini assessment JSON', {
      grade: gradeStr,
      phase,
      assessmentId,
    }, e);
    return null;
  }
};
