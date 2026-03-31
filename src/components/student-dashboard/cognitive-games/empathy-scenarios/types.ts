export interface EmpathyResponse {
  text: string;
  feedback: string;
  type: 'best' | 'good' | 'neutral' | 'poor';
}

export interface EmpathyScenario {
  id: number;
  category: string;
  title: string;
  situation: string;
  emotion: { icon: string; label: string };
  responses: EmpathyResponse[];
  correctAnswer: string;
  correctExplanation: string;
  tip: string;
}
