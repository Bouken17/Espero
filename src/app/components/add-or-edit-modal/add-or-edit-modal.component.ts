import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Category } from 'src/app/models/category';
import { Product } from 'src/app/models/product';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-add-or-edit-modal',
  templateUrl: './add-or-edit-modal.component.html',
  styleUrls: ['./add-or-edit-modal.component.css']
})
export class AddOrEditModalComponent implements OnInit,OnChanges, OnDestroy {

  @Input() product: Product; //valeur du produit récuperer ds le comp show-product
  @Output() finish = new EventEmitter();//l'evenement à envoyer au comp show-product après click sur button terminer
  productForm: FormGroup;
  categories: Category[];
  categorySub: Subscription;
  idCategory = 1;
  file: File;

  constructor(private fb: FormBuilder,private categoryService:CategoriesService) {
    this.productForm = fb.group({
      productInfo: fb.group({
        name:["",Validators.required],
        description:["",Validators.required],
        price:["",Validators.required],
        stock:["",Validators.required],
      }),
      illustration: fb.group({
        image:[null,Validators.required]
      })
    })
   }

  selectCategory(id: number) {
    this.idCategory = id;
   }

  get isProductInfoInvalid(): boolean{ //get permet de l'utiliser coe une valeur sans parenthese
    return this.productForm.get('productInfo').invalid; //test si le champs est valide ou pas
  }

  get isIllustrationInfoInvalid(): boolean{ //get permet de l'utiliser coe une valeur sans parenthese
    if (this.product) { //tester si le produit existe donc ca veut dire on veut modifier
      return false;//on met invalide a false donc on doit pas obliger la selection d'une image
    }
    return this.productForm.get('illustration').invalid; //test si le champs est valide ou pas
  }

  handleCancel() {
    this.finish.emit(); //informer le parent component qui utilise le comp add-or-edit
    this.close;
   }

  handleFinish() { //action pour valider l'ajout ou modif d'un produit
    let product = {//objet à envoyer
      ...this.productForm.get('productInfo').value, //recupere les infos saisi ds l'etape productInfo
      ...this.productForm.get('illustration').value, //recupere l'image selectionnée ds l'eetape illustration
      category: this.idCategory, //recuperer l'id de la categorie selectionnée
      oldImage:this.product.oldImage//si oldProduct n'est pas définie
    };

    /* if (this.product) {//Si ildProduct est définie
      product.oldImage = this.product.oldImage;
    } */

    if (this.file) { //On verifie si le fichier est défini recuperont son nom
      product.image = this.file.name;//variable image du model recoit l'image d"finie
    } else {
      product.image = this.product.oldImage;//recupere le nom et l'envoie à updateImage pour mettre dans oldImage
    }
    this.finish.emit({product: product,file: this.file ? this.file : null}); //emettre ses informations au comp show qui utilise ce comp
    this.close(); //fermer le wizard
  }

  close() { //fermer le wizard
    this.productForm.reset(); //renitialiser les valeurs recuperer ds le formulaire
    this.idCategory = 1; //renitialiser l'id selectionné de la categorie faites ds l'etape 1
  }

  detectFiles(event) {
      this.file = event.target.files[0]; //on recupere le premier element et le stock ds la fichier
  }

  updateForm(product:  Product) {
    this.productForm.patchValue({//pré-remplir le formulaire
      productInfo: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock
      }
    });
    //console.log(this.product);
    product.oldImage = product.image; //pour garder l'ancien nom de l'image
    this.selectCategory(product.Category);//recuperer la categorie du produit délextionné
  }

  ngOnInit(): void {
    this.categorySub = this.categoryService.getCategory().subscribe(
      (response) => {
        this.categories =response.result
        //console.log(this.categories);
       },
    )
  }

  ngOnChanges(): void{//detecter le changement pour utiliser la modification
    if (this.product) { //si le produit est définie
      this.updateForm(this.product);
    }
  }

  ngOnDestroy() {
    this.categorySub.unsubscribe();
  }

}
