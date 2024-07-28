import { Comment } from "./comment.interface";
export interface Recipe {
    recipe_id: string;
    recipe_image: string;
    recipe_name: string;
    recipe_ingredients: string[];
    recipe_steps: string[];
    recipe_cuisine: string;
    recipe_cookingTime: string;
    saved: boolean;
    likes: number;
    userLikes: string[];
    uid: string;
    postedBy?: string;
    userComment?:string[];
    comments: Comment[];
}
