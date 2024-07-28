import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Recipe } from './recipe.interface';
import { Comment } from './comment.interface';
import { map } from 'rxjs/operators';
import { get } from 'jquery';
@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private fire: Firestore
  ) {}

  addRecipe(recipeData: any): Promise<void> {
    return firebase
      .firestore()
      .collection('recipes')
      .doc(recipeData.recipe_id)
      .set(recipeData);
  }

  getRecipes(): Observable<Recipe[]> {
    return this.firestore.collection<Recipe>('recipes').valueChanges();
  }

  getRecipeById(recipeId: string): Observable<Recipe | undefined> {
    return this.firestore
      .collection<Recipe>('recipes')
      .doc(recipeId)
      .valueChanges();
  }
  // getrec(uid: string): Observable<Recipe | null>{
  //   const ref = doc(this.fire, `recipes/${uid}`);
  //   return docData(ref).pipe(

  //   ) as Observable<Recipe | null>;
  // }
  // getUser(uid: string): Observable<ProfileUser | null> {
  //   const ref = doc(this.firestore, `Users/${uid}`);
  //   return docData(ref).pipe(
  //     catchError(error => {
  //       console.error('Error fetching user data:', error);
  //       return of(null);
  //     })
  //   ) as Observable<ProfileUser | null>;
  // }
  getRecipesByUser(uid: string): Observable<Recipe[]> {
    return this.firestore
      .collection<Recipe>('recipes', (ref) => ref.where('uid', '==', uid))
      .valueChanges();
  }
  getAllProducts() {
    return this.firestore.collection('/recipes').snapshotChanges();
  }

  updateRecipeLikes(
    recipeId: string,
    likes: number,
    userLikes: string[]
  ): Promise<void> {
    const recipeRef = this.firestore.collection('recipes').doc(recipeId);
    return recipeRef.update({ likes: likes, userLikes: userLikes });
  }

  addComment(recipeId: string, comment: Comment): Promise<void> {
    return firebase
      .firestore()
      .collection('recipes')
      .doc(recipeId)
      .update({
        comments: firebase.firestore.FieldValue.arrayUnion(comment),
      });
  }

  searchRecipes(criteria: string, query: string): Observable<Recipe[]> {
    if (criteria === 'recipe_ingredients') {
      return this.firestore
        .collection<Recipe>('recipes', (ref) =>
          ref.where(criteria, 'array-contains', query)
        )
        .valueChanges();
    } else {
      return this.firestore
        .collection<Recipe>('recipes', (ref) =>
          ref
            .where(criteria, '>=', query)
            .where(criteria, '<=', query + '\uf8ff')
        )
        .valueChanges();
    }
  }
}
