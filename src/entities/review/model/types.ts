export type ReviewPayload = {
  name: string;
  location: string;
  date: string;
  menu: string;
  companion: string;
  summary: string;
  pros?: string;
  cons?: string;
  extra?: string;
};

export type ReviewEditPayload = {
  review: string;
  request: string;
};
