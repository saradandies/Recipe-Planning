import { Injectable } from "@angular/core";
import {
    Auth,
    signInWithEmailAndPassword,
    authState,
    createUserWithEmailAndPassword,
    updateProfile,
    UserCredential,
  } from '@angular/fire/auth';
  import { Observable, from } from 'rxjs';

@Injectable({
    providedIn:'root'
})

export class AuthenticationService
{

    currentUser$ = authState(this.auth);

    constructor(private auth: Auth) {}
  
    signUp(email: string, password: string): Observable<UserCredential> {
      return from(createUserWithEmailAndPassword(this.auth, email, password))
    //   .pipe
    //   .switchMap(({user})=>updateProfile(user,{displayName:name}));
    }
  
    login(email: string, password: string): Observable<any> {
      return from(signInWithEmailAndPassword(this.auth, email, password));
    }
  
    logout(): Observable<any> {
      return from(this.auth.signOut());
    }

  }