export interface ReadingMaterial {
  id: number;
  title: string;
  category: string;
  readTime?: string;
  rating?: number;
  description: string;
  type: string;
  content: string;
  author: string;
  publishDate?: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
