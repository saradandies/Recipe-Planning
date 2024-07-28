import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ProfileUser } from '../user.interface';
import { Recipe } from '../recipe.interface';
import { environment } from '../../environments/environment';
import { RecipeService } from '../recipe.service';
import { ShowMoreComponent } from '../show-more/show-more.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-saved-recipe',
  templateUrl: './saved-recipe.component.html',
  styleUrl: './saved-recipe.component.css'
})
export class SavedRecipeComponent implements OnInit {

  currentUser: ProfileUser | null = null; // Declare currentUser property of type ProfileUser
  savedRecipes: Recipe[] = [];

  constructor(private recservice:RecipeService,public dialog: MatDialog) { }

  ngOnInit(): void {
    firebase.initializeApp(environment.firebase);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.getSavedRecipesForUser(user.uid);
      } else {
        console.error('User not authenticated.');
      }
    });
  }
  // getReceipeById(ayhaga:any) {
  //   this.recservice.getRecipeById(ayhaga);
  // }

  async getSavedRecipesForUser(userId: string) {
    try {
      const userDoc = await firebase.firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data() as ProfileUser;

      const savedRecipeIds = userData.savedRecipes || [];

      const savedRecipes: Recipe[] = [];
      await Promise.all(savedRecipeIds.map(async (recipeId: string) => {
        const recipeDoc = await firebase.firestore().collection('recipes').doc(recipeId).get();
        if (recipeDoc.exists) {
          const recipeData = recipeDoc.data() as Recipe;
          savedRecipes.push(recipeData);
        } else {
          console.warn(`Recipe with ID ${recipeId} does not exist.`);
        }
      }));

      this.savedRecipes = savedRecipes;
      console.log('Saved Recipes:', this.savedRecipes);
    } catch (error) {
      console.error('Error getting saved recipes:', error);
    }
  }
}
