export interface Review {
  id: string; // filename without extension
  storeName: string;
  date: string;
  content: string;
  preview: string; // First few lines or summary
}
