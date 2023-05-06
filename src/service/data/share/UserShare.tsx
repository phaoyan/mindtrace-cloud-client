export interface UserShare{
    id: number,
    userId: number,
    visits: number,
    likes: number,
    favorites: number
}

export const defaultUserShare = {
    id: -1,
    userId: -1,
    visits: -1,
    likes: -1,
    favorites: -1
}