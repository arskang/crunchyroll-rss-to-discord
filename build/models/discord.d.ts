export interface Discord {
    content?: string;
    embeds: Embed[];
    attachments?: any[];
}
export interface Embed {
    title?: string;
    description?: string;
    url?: string;
    image?: Image;
    color?: number;
    fields?: Field[];
}
export interface Field {
    name: string;
    value: string;
}
export interface Image {
    url: string;
}
