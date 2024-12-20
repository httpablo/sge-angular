export class Product {
  public id: number;
  public title: string;
  public description: string | undefined;
  public serie_number: string | undefined;
  public cost_price: number;
  public selling_price: number;
  public quantity: number;
  public created_at: string;
  public updated_at: string;
  public category: string;
  public brand: string;

  constructor() {
    this.id = 0;
    this.title = '';   
    this.description = '';
    this.serie_number = '';
    this.cost_price = 0;
    this.selling_price = 0;
    this.quantity = 0;
    this.created_at = '';
    this.updated_at = '';
    this.category = ''; 
    this.brand = ''; 
  }
}
