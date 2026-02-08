export type ReviewPayload = {
  name: string;
  location: string;
  date: string;
  menu: string;
  companion: string;
  pros?: string;
  cons?: string;
  extra?: string;
  user_draft?: string;
};

export type RestaurantPayload = ReviewPayload;

export type ReviewEditPayload = {
  review: string;
  request: string;
};

export type BookPayload = {
  title: string;
  author: string;
  readDate?: string;
  genre?: string;
  pros?: string;
  extra?: string;
};
