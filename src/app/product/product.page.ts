import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from './product.model';
import { Usuario } from '../home/usuario.model';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import {
  IonicModule,
  LoadingController,
  NavController,
  ToastController,
  AlertController
} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [HttpClient, Storage],
})
export class ProductPage implements OnInit {
  public usuario: Usuario = new Usuario();
  public products: Product[] = [];

  constructor(
    public http: HttpClient,
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    public alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);

      // Chamar o método para listar produtos
      this.consultarProductsSistemaWeb();
    } else {
      this.controle_navegacao.navigateRoot('/home');
    }
  }

  async consultarProductsSistemaWeb() {
    const Loading = await this.controle_carregamento.create({
      message: 'Pesquisando...',
      duration: 60000,
    });
    await Loading.present();

    const httpHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.usuario.token}`,
    });

    this.http
      .get<Product[]>('http://127.0.0.1:8000/api/v1/products/', {
        headers: httpHeaders,
      })
      .subscribe({
        next: async (resposta: Product[]) => {
          this.products = resposta;
          await Loading.dismiss();
        },
        error: async (erro: any) => {
          await Loading.dismiss();
          const message = await this.controle_toast.create({
            message: `Erro ao carregar produtos: ${
              erro.error?.detail || erro.message
            }`,
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          message.present();
        },
      });
  }

  async excluirProduct(id: number) {
    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({
      message: 'Autenticando...',
      duration: 30000,
    });
    await loading.present();

    let http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.usuario.token}`,
    });

    // Deleta instância de veículo via API do sistema web
    this.http
      .delete(`http://127.0.0.1:8000/api/v1/products/${id}/`, {
        headers: http_headers,
      })
      .subscribe({
        next: async (resposta: any) => {
          this.consultarProductsSistemaWeb();

          // Finaliza interface com efeito de carregamento
          loading.dismiss();
        },
        error: async (erro: any) => {
          loading.dismiss();
          const mensagem = await this.controle_toast.create({
            message: `Falha ao excluir o veículo: ${erro.message}`,
            cssClass: 'ion-text-center',
            duration: 2000,
          });
          mensagem.present();
        },
      });
  }
  
  navigateToCreateProduct() {
    this.router.navigate(['/create-product']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Sair',
      message: 'Você tem certeza que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Logout cancelado');
          }
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.storage.remove('usuario'); 
            this.controle_navegacao.navigateRoot('/home'); 
            const toast = await this.controle_toast.create({
              message: 'Você foi desconectado com sucesso.',
              duration: 2000,
              cssClass: 'ion-text-center'
            });
            toast.present();
          }
        }
      ]
    });
    await alert.present();
  }
}
