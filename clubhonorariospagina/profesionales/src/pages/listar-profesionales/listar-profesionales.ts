import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { ProfesionalesProvider } from '../../providers/profesionales/profesionales';
import { FormProfesionalPage } from '../form-profesional/form-profesional';

/**
 * Generated class for the ListarProfesionalesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-listar-profesionales',
  templateUrl: 'listar-profesionales.html',
})
export class ListarProfesionalesPage {
  public respuesta: any;
  public loading:any;
  public listaProfesionales:any;
  public listaProfesionalesBusqueda:any;
  public searchTerm: any = '';


  constructor(public navCtrl: NavController, 
              public profesionalesProvider:ProfesionalesProvider,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListarProfesionalesPage');
    this.profesionalesProvider.obtenerProfesionales().then((data)=>{
      this.listaProfesionales = data;
      for(let p of this.listaProfesionales){
        p.apellidoNombre = p.apellido+' '+p.nombre;
      }
      this.listaProfesionalesBusqueda = this.listaProfesionales;
    }); 
  }

  setFilteredItems() {
    if(this.searchTerm.length > 2){
      if(isNaN(this.searchTerm)){
        console.log('no es un numoero')
        
        this.listaProfesionalesBusqueda = this.listaProfesionales.filter((item) => {
          // IndexOf() devuelvo la passicion de letra que esta buscando, entonces si yo
          // hago === 0 significa que le digo que quiero que me devuelvas todos los valores
          // donde el appellido comienze con R.
          // si por ejemplo hago > -1 hago que donde encuentre la coincidencia lo devuelva
          // osea que si un apellido es juarez, y aprieto la R lo va a devolver.
          return item.apellidoNombre.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
        
        });
      }else{
        console.log('es un numoero')
        this.listaProfesionalesBusqueda = this.listaProfesionales.filter((item) => {
          return item.dni.toString().indexOf(this.searchTerm) === 0;
        }); 
      }
    }else{
      this.listaProfesionalesBusqueda = this.listaProfesionales.filter((item) => {
        return item.apellidoNombre.toLowerCase().indexOf('') > -1;
      });
    }
  }

  irDetalles(p,editable){
    this.navCtrl.push(FormProfesionalPage, { profesional: p ,edit:editable});
  }

  botonEliminar(idProfesional){
    let titulo = "Eliminar Profesional";
    let mensaje = "¿Esta seguro que desea eliminar el profesional?";
    let funcion = "baja";
    // respuesta = this.confirmarAlerta(titulo,mensaje);
    this.confirmarEliminar(titulo,mensaje,idProfesional);
  }

  confirmarEliminar(titulo,mensaje,idProfesional) {
    let alert = this.alertCtrl.create({
      title: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.eliminar(idProfesional);
          }
        }
      ]
    });
    alert.present();
  }

  eliminar(idProfesional){
    this.showLoader('Eliminando Profesional. Por favor espere...');
    let details = {
      idProfesional: parseInt(idProfesional),
    };
    this.profesionalesProvider.eliminarProfesional(details).then((data)=>{
      this.loading.dismiss();
      this.respuesta = data[0];
      if(this.respuesta.codigo !== 0){
        this.mostrarAlerta('Operacion Exitosa',this.respuesta.mensaje);
      }else{
        this.mostrarAlerta('ERROR',this.respuesta.mensaje);
      }
    });

  }

  showLoader(mensaje){
    this.loading = this.loadingCtrl.create({
      content: mensaje
    });
    this.loading.present();
}

mostrarAlerta(titulo,mensaje) {
  let alert = this.alertCtrl.create({
  title: titulo,
  subTitle: mensaje,
  buttons: ['ACEPTAR']
  });
  alert.present();
}

}
