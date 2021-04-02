import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { Response } from 'src/app/models/response';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ProductsService } from 'src/app/services/products.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-show-products',
  templateUrl: './show-products.component.html',
  styleUrls: ['./show-products.component.css']
})
export class ShowProductsComponent implements OnInit {

  @Input() products: Product[];
  productModalOpen = false;
  selectedProduct: Product;
  file: File;//le fichier qui sera recuperer depuis le comp add-or-edit
  progress = 0;
  baseUrlImage = `${environment.api_image}`;

  constructor(private productService:ProductsService, private fileUploadService:FileUploadService) { }

  ngOnInit(): void {
  }

  onEdit(product:Product) {
    this.productModalOpen = true;
    this.selectedProduct = product;
  }

  addProduct(): void{
    this.selectedProduct = undefined;
    this.productModalOpen = true;
  }

  handleFinish(event) { //action pour valider le formulaire
    if (event && event.product) { //tester si le produit en parametre existe(c-à-d l'admin est aller jusqu'au bout du formulaire et a cliquer sur le button finish)
      let product = event.product ? event.product : null; //verifie si event contient un produit
      this.file = event.file ? event.file : null; //verifie si event contient un fichier
      console.log(product);
      if (this.selectedProduct) { //s'il a cliquer sur on edit ca veut dire que le produit existe déjà et a été selectionné
        product.idProduct = this.selectedProduct.idProduct; //on recupere l'id du produit selectionner pour passer à la methode ci dessous
        this.editProductToServer(product);
        console.log(product);
      } else { //sinon ca veut dire il veut ajouter un produit
        this.addProductToServer(product);
      }

    }
    this.productModalOpen=false
  }

  addProductToServer(product) {
    this.productService.addProduct(product).subscribe(
      (data: Response) => {
        //console.log(data)
        //arranger le produit en haut d'affichage
        if (data.status == 200) { //verifie si le produit est bien enregistrer
          if (this.file) { //verifie si file existe
            this.fileUploadService.uploadImage(this.file).subscribe(
              (event: HttpEvent<any>) => { //ecoute d'evenement reportProgress et observe
                this.uploadImage(event).then(//si la MAJ est bien fait alors
                  () => {
                    product.idProduct = data.args.LastInsertId; //recupère l'id du produit enregistré
                    product.Category = product.category;
                    this.products.push(product); //Mettre le produit dans le tableau et en haut
                  }
                )
              }
            )
          }
        }
      },
    );
  }

  uploadImage(event) {
    return new Promise( //promesse pour pouvoir attendre le resultat apres MAJ
      (resolve) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log("requete envoyé avec succès");
            break;
          case HttpEventType.UploadProgress:
            this.progress = Math.round(event.loaded / event.total * 100);
            if (this.progress == 100) {//verifie si ona fini d'uploader l'image
              resolve(true);//declare terminer
            }
            break;
          case HttpEventType.Response: //lorsque l'upload est fini
            console.log(event.body);
            setTimeout(() => {
              this.progress = 0;
            },15000)
        }
      }
    )
  }

  onDelete(products) {

  }


  editProductToServer(product) {
    this.productService.editProduct(product).subscribe(
      (data:Response) => {
        if (data.status == 200) { //si le produit est bien inserer
          if (this.file) { //on test si le fichier est défini
            this.fileUploadService.uploadImage(this.file).subscribe(
              (event: HttpEvent<any>) => {
                this.uploadImage(event).then( //On met à jour le fichier
                  () => {
                    this.updateProducts(product);
                  }
                )
              }
            );
            this.fileUploadService.deleteImage(product.oldImage).subscribe(//On supprime l'ancien nom d'image
              (data: Response) => {
                console.log(data);
              }
            );
          } else {
            this.updateProducts(product);
          }

        } else {
          console.log(data.message);
        }
      }
    )
  }

  updateProducts(product) {
    //update front
    const index = this.products.findIndex(p => p.idProduct == product.idProduct);//verifie l'elt qui a le meme id ensuite le return
    product.Category = product.category;//pour pré-selectionner un produit car on recupere category avec un grand c contrairement au c du methode
    this.products = [
      ...this.products.slice(0, index),//on ajoute après l'elt 0 jusqu'a avant dernier elt de indexe
      product,//On ajoute le produit qui vient s'etre modifier
      ...this.products.slice(index+1)//on a
    ]
  }

}
