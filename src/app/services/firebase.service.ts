import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private db: AngularFireDatabase,
  ) { }

  createObject(ref: string, opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.db.list(ref).push(opts);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  updateObject(ref: string, opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.db.object(ref).update(opts);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  replaceObject(ref: string, opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.db.object(ref).set(opts);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  removeObject(ref: string, opts?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.db.object(ref).remove();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
