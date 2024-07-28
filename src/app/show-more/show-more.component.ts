import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ProfileUser } from '../user.interface';
import { Recipe } from '../recipe.interface';
import { environment } from '../../environments/environment';

import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-show-more',
  templateUrl: './show-more.component.html',
  styleUrl: './show-more.component.css',
})
export class ShowMoreComponent {
  idProduct: any;
  recipe$: any;
  productsList: Recipe[] = [];
  constructor(
    private recipeService: RecipeService,
    private router: ActivatedRoute
  ) {
    this.idProduct = this.router.snapshot.params;
    //this.idProduct = this.router.snapshot.paramMap.get('id');
    this.ngOnInit();
  }
  // ngOnInit() {
  //   this.recipe$ = this.recipeService.getRecipeById(this.idProduct);
  //   this.recipe$= firebase.firestore().collection('recipes').doc(this.idProduct).get();
  //   }
  //getrec
  getAllProduct() {
    this.recipeService.getAllProducts().subscribe(
      (res) => {
        this.productsList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        }); //.find((product: Recipe) => product.recipe_id === this.idProduct);
        console.log(this.productsList);
        console.log(this.idProduct);
      },
      (err) => {
        alert('Error while fetching product data');
      }
    );
  }
  ngOnInit() {
    this.recipeService.getRecipeById(this.idProduct).subscribe(
      (recipe) => {
        if (recipe) {
          this.recipe$ = recipe; // Assign the complete recipe to recipe$
        } else {
          console.error('Recipe not found for id:', this.idProduct);
        }
      },
      (err) => {
        alert('Error while fetching recipe data');
      }
    );
  }
}
