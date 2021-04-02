import { Component, OnInit } from '@angular/core';
import { Response } from 'src/app/models/response';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products;
  productSub;
  constructor(private productsService:ProductsService) { }

  ngOnInit(): void {
    this.productSub = this.productsService.getProducts().subscribe(
      (response: Response) => {
        this.products = response.result;
        //console.log(response);
      },
      (error) => {
        console.log("erreur de recuperation de produit "+error);
      }
    )
  }

}
