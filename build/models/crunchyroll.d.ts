export interface CrunchyrollRSS {
    title: string;
    description: string;
    link: string;
    image: string;
    category: any[];
    items: Item[];
}
export interface Item {
    id: string;
    title: string;
    description: string;
    link: string;
    published: number;
    created: number;
    category: Category;
    enclosures: Array<PurpleEnclosure[] | FluffyEnclosure>;
    media: Media;
}
export declare enum Category {
    Anime = "Anime"
}
export interface PurpleEnclosure {
    url: string;
    width: string;
    height: string;
}
export interface FluffyEnclosure {
    url?: string;
    type: Type;
    length?: string;
    medium?: Medium;
    duration?: string;
}
export declare enum Medium {
    Video = "video"
}
export declare enum Type {
    ImageJPEG = "image/jpeg",
    VideoMp4 = "video/mp4"
}
export interface Media {
    thumbnail: Thumbnail;
}
export interface Thumbnail {
    type: Type;
    medium: Medium;
    duration: string;
}
