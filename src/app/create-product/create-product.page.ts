import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { ToastController, ModalController } from '@ionic/angular';
import { Product } from '../product/product.model';
import { Usuario } from '../home/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.page.html',
  styleUrls: ['./create-product.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
  providers: [HttpClient, Storage]
})
export class CreateProductPage {
  product: Product = new Product();
  categories: any[] = [];
  brands: any[] = [];
  usuario: Usuario | null = null;
  navCtrl: any;


  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private storage: Storage,
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      this.loadCategories();
      this.loadBrands();
    } else {
      this.showToast('Usuário não autenticado.', 2000);
      this.fecharModal();
    }
  }

  async loadCategories() {
    if (!this.usuario?.token) return;
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.usuario.token}`,
    });

    try {
      const response = await this.http
        .get('http://127.0.0.1:8000/api/v1/categories/', { headers: httpHeaders })
        .toPromise();

         // Verifica se a resposta é um array
      if (Array.isArray(response)) {
        this.categories = response;  // Atribui se for um array
      } else {
        this.categories = [];  // Ou inicializa como um array vazio se não for um array
      }
  
      console.log('Brands loaded:', this.categories);  // Verifique os dados no console

    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      this.categories = [];  // Caso ocorra erro, também inicialize como array vazio
    }
  }

  async loadBrands() {
    if (!this.usuario?.token) return;
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.usuario.token}`,
    });
    
    try {
      const response = await this.http.get('http://127.0.0.1:8000/api/v1/brands/', { headers: httpHeaders }).toPromise();
      
      // Verifica se a resposta é um array
      if (Array.isArray(response)) {
        this.brands = response;  // Atribui se for um array
      } else {
        this.brands = [];  // Ou inicializa como um array vazio se não for um array
      }
  
      console.log('Brands loaded:', this.brands);  // Verifique os dados no console
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      this.brands = [];  // Caso ocorra erro, também inicialize como array vazio
    }
  }

  async confirmarCadastro() {
    if (!this.usuario?.token) {
      this.showToast('Usuário não autenticado.', 2000);
      return;
    }

    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.usuario.token}`,
    });

    const formData = new FormData();
    formData.append('title', this.product.title);
    formData.append('description', this.product.description || '');
    formData.append('serie_number', this.product.serie_number || '');
    formData.append('cost_price', this.product.cost_price.toString());
    formData.append('selling_price', this.product.selling_price.toString());
    formData.append('quantity', this.product.quantity.toString());
    formData.append('category', this.product.category);
    formData.append('brand', this.product.brand);

    try {
      await this.http
        .post('http://127.0.0.1:8000/api/v1/products/', formData, {
          headers: httpHeaders,
        })
        .toPromise();
      this.showToast('Produto cadastrado com sucesso!', 2000);
      this.router.navigate(['/product']);
      this.fecharModal();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      this.showToast('Erro ao cadastrar produto.', 2000);
    }
  }

  async showToast(message: string, duration: number) {
    const toast = await this.toastController.create({
      message,
      duration,
    });
    toast.present();
  }

  voltarParaProdutos() {
    this.router.navigate(['/product']);
  }

  fecharModal() {
    this.modalController.dismiss();
  }
}
