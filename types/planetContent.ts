export interface PlanetContent {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  avatar?: string;
  quote?: string;
  details?: {
    label: string;
    value: string;
  }[];
  strengths?: string[];
  advantages?: string[] | Array<{
    name: string;
    role: string;
    avatar?: string;
    content: string;
  }> | {
    supervisors: Array<{
      name: string;
      role: string;
      avatar?: string;
      content: string;
    }>;
    colleagues: Array<{
      name: string;
      role: string;
      avatar?: string;
      content: string;
    }>;
  };
  coreValues?: string[];
  links?: {
    id: string;
    label: string;
    url: string;
    icon?: string;
  }[];
  projects?: {
    title: string;
    description?: string;
    url?: string;
    tags?: string[];
    image?: string;
  }[];
  color?: string;
}
