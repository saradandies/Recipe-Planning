import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { RecipeService } from '../recipe.service'; 
import { ProfileUser } from '../user.interface';
import { Recipe } from '../recipe.interface';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { environment } from '../../environments/environment';
import { Comment } from '../comment.interface';
import { Observable, map } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] 
})
export class HomeComponent implements OnInit {

  storage: any; 
  currentUser: ProfileUser | null = null;

  recipes: Recipe[] = [];
  recipe_id:string='';
  recipe_image: string = ''; 
  recipe_name: string = '';
  recipe_ingredients: string = '';
  recipe_steps: string[] = [];
  recipe_cuisine:string='';
  recipe_cookingTime:string=''
  likes:number=0;
  userLikes:string='';
  userComment:string[]=[];
  comments:Comment[]=[];
  searchQuery: string = '';
  selectedCriteria: string = 'recipe_name';


  constructor(
    private userService: UsersService,
    private recipeService: RecipeService,     
  ) {
    for (let i = 0; i < this.recipes.length; i++) {
      this.recipes[i].saved = false;
    }
  }

  ngOnInit() {
    firebase.initializeApp(environment.firebase);
    this.storage = firebase.storage();

    this.getRecipes();
  
    this.userService.currentUserProfile$.subscribe(userProfile => {
      if (userProfile) {
        this.currentUser = userProfile;
      }
    });
  }

  async addRecipe() {
    try {
      this.recipe_id = await this.generateRecipeId();
      let ingredientsArray: string[] = [];
      if (this.recipe_ingredients.includes(',')) {
        ingredientsArray = this.recipe_ingredients.split(',').map((ingredient: string) => ingredient.trim());
      } else {
        ingredientsArray.push(this.recipe_ingredients.trim());
      }
  
      const imageRef = this.storage.ref(`recipe_images/${this.recipe_id}`);
      const uploadTask = imageRef.put(this.recipe_image);
  
      uploadTask.then(async (snapshot: firebase.storage.UploadTaskSnapshot) => { // Explicitly specify the type
        const downloadURL = await imageRef.getDownloadURL();
  
        const recipeData = {
          recipe_id: this.recipe_id,
          recipe_image: downloadURL, // Store the download URL instead of the file object
          recipe_name: this.recipe_name,
          recipe_ingredients: ingredientsArray, // Use the array of ingredients
          recipe_steps: this.recipe_steps,
          recipe_cuisine: this.recipe_cuisine,
          recipe_cookingTime: this.recipe_cookingTime,
          uid: this.currentUser?.uid,
          likes: this.likes,
          userLikes: this.userLikes,
          userComment: this.userComment,
          comments: this.comments,
        };
  
        // Add recipe data to Firestore
        await this.recipeService.addRecipe(recipeData);
        this.getRecipes();
        this.clearFormFields();
      });
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  }
  
  
  async getRecipes() {
    try {
      this.recipeService.getRecipes().subscribe({
        next: async (recipes: Recipe[]) => {
          this.recipes = recipes;
          for (const recipe of this.recipes) {
            if (recipe.uid) { 
              const userDoc = await firebase.firestore().collection('Users').doc(recipe.uid).get();
              if (userDoc.exists) {
                recipe.postedBy = userDoc.data()?.['displayName'];
              }
            }
          }
          console.log(this.recipes);
        },
        error: (error: any) => {
          console.error('Error fetching recipes:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  }
  

async saveRecipe(recipe: Recipe) {
  try {
    console.log('Current user:', this.currentUser);
    console.log('Recipe:', recipe);

    if (!this.currentUser) {
      console.error('User not authenticated.');
      return;
    }

    if (!recipe || !recipe.recipe_id) { // Adjust this line to use recipe.recipe_id
      console.error('Recipe ID is undefined.');
      return;
    }

    const userRef = firebase.firestore().collection('Users').doc(this.currentUser.uid);

    // Check if the recipe ID is already in the savedRecipes array
    const userDoc = await userRef.get();
    const savedRecipes = userDoc.data()?.['savedRecipes'] || [];
    
    if (savedRecipes.includes(recipe.recipe_id)) { // Adjust this line to use recipe.recipe_id
      // Recipe already saved, remove it from savedRecipes array
      await userRef.update({
        savedRecipes: firebase.firestore.FieldValue.arrayRemove(recipe.recipe_id) // Adjust this line to use recipe.recipe_id
      });
      console.log('Recipe removed from saved recipes.');
    } else {
      // Recipe not saved, add it to savedRecipes array
      await userRef.update({
        savedRecipes: firebase.firestore.FieldValue.arrayUnion(recipe.recipe_id) // Adjust this line to use recipe.recipe_id
      });
      console.log('Recipe saved successfully.');
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
}

  onFileSelected(event: any) {
    this.recipe_image = event.target.files[0];
  }

  async generateRecipeId(): Promise<string> {
    const docRef = firebase.firestore().collection('recipes').doc();
    return docRef.id;
  }

  clearFormFields() {
    this.recipe_image = '';
    this.recipe_name = '';
    this.recipe_ingredients ='';
    this.recipe_steps = [];
    this.recipe_cuisine = '';
    this.recipe_cookingTime = '';
  }

  async likeRecipe(recipe: Recipe, userId: string) {
    try {
      const alreadyLiked = recipe.userLikes.includes(userId);
      let updatedLikes = alreadyLiked ? recipe.likes - 1 : recipe.likes + 1;
      const updatedLikedUsers = alreadyLiked
        ? recipe.userLikes.filter(id => id !== userId)
        : [...recipe.userLikes, userId];
      await this.recipeService.updateRecipeLikes(recipe.recipe_id, updatedLikes, updatedLikedUsers);
      const index = this.recipes.findIndex(r => r.recipe_id === recipe.recipe_id);
      if (index !== -1) {
        this.recipes[index].likes = updatedLikes;
        this.recipes[index].userLikes = updatedLikedUsers;
      }
      console.log('Recipe liked successfully.');
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  }

  newCommentText: string = '';
  prepareComment(recipeId: string) {
    this.recipe_id = recipeId;
    this.newCommentText = '';
}
  addComment() {
    const comment: Comment = {
        userId: this.currentUser?.uid || '', 
        text: this.newCommentText,
        createdAt: new Date(),
        username:this.currentUser?.displayName || '',
      };
        this.recipeService.addComment(this.recipe_id, comment)
        .then(() => {
            console.log('Comment added successfully.');
            this.getRecipes();
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
  }

  searchRecipes() {
    if (!this.searchQuery) {
      this.getRecipes(); 
      return;
    }
    this.recipeService.searchRecipes(this.selectedCriteria, this.searchQuery).subscribe((filteredRecipes: Recipe[]) => {
      this.recipes = filteredRecipes;
    });
  }

  
}

  
