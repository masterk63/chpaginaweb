var operacion = require('./../models/operaciones');
var fechas = require('./../models/operaciones');
var comisiones = require('./../models/operaciones');
var nodemailer = require('nodemailer');
var dateformat = require('dateformat');
var configMP = require('./../config/mercadoPago.js');

exports.getOperaciones = function(req, res, next){
    operacion.getOperaciones(function(consulta){
        res.json(consulta);
    });
}

exports.getOperacionesPorFecha = function(req, res, next){
    var fechaInicio = '"'+req.body.fechaInicio+'"';
    var fechaFin = '"'+req.body.fechaFin+'"';
    operacion.getOperacionesPorFecha(fechaInicio,fechaFin,function(consulta){
        res.json(consulta);
    });
}

exports.getFechas = function(req, res, next){
    fechas.getFechas(function(consulta){
        res.json(consulta);
    });
}

exports.getComisiones = function(req, res, next){
    comisiones.getComisiones(function(consulta){
        res.json(consulta);
    });
}

exports.dameOperacion = function(req, res, next){
    console.log("dentro de controller nodjs "+req.body.idOperacion);
    var idOperacion = req.body.idOperacion;
    operacion.dameOperacion(idOperacion,function(consulta){
        res.json(consulta);
    });
}

exports.operacionNueva = function(req, res, next){
    var MP = require ("mercadopago");

    var mp = new MP (configMP.access_token);
    
    var doPayment = mp.post ("/v1/payments",
    {
        "transaction_amount": req.body.importeCarga,
        "token": req.body.sdkResponse.id,
        "description": "Pago de Honorarios a "+req.body.apellidoProfesional+', '+req.body.nombreProfesional,
        "payer": {
            "email": req.body.mailCliente,
            // "email": '',
        },
        "installments": parseInt(req.body.cuotas),
		"payment_method_id": req.body.payment_method_id,
		"issuer_id": parseInt(req.body.issuer_id)
    });
    
    doPayment.then (
        (payment) => {
            console.log (payment);
            var oDniProfesional = req.body.dniProfesional;
            var oApellidoProfesional = '"'+req.body.apellidoProfesional+'"';
            var oNombreProfesional = '"'+req.body.nombreProfesional+'"';
            var oMailProfesional = '"'+req.body.mailProfesional+'"';
            var oDniCliente = req.body.dniCliente;
            var oApellidoCliente = '"'+req.body.apellidoCliente+'"';
            var oNombreCliente = '"'+req.body.nombreCliente+'"';
            var oTelefonoCliente = '"'+req.body.telefonoCliente+'"';
            var oMailCliente = '"'+req.body.mailCliente+'"';
            var oTarjeta = '"MP"';
            // var oTarjeta = '"MPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP"';
            var oImporteVenta = req.body.importeVenta;
            var oImporteCobrar = req.body.importeCobrar;
            var oCuotas = req.body.cuotas;
            var oImporteCarga = req.body.importeCarga;
            var oImporteCuota = req.body.importeCuota;
            var oCodigoAuto = 0;
            var oCupon = payment.response.id;
            var oTipoTarjeta = '"C"';
        
        
            operacion.operacionNueva(oDniProfesional,oApellidoProfesional,oNombreProfesional,oMailProfesional,
                oDniCliente,oApellidoCliente,oNombreCliente,oTelefonoCliente,oMailCliente,oTarjeta,oImporteVenta,
                oImporteCobrar,oCuotas,oImporteCarga,oImporteCuota,oCodigoAuto,oCupon,oTipoTarjeta,function(consulta){
                    console.log(consulta);
                    if(consulta[0].codigo >= 1){
                        var respuesta = consulta[0];
                        var oFechaTransaccion = respuesta.fechaTransaccion;
                        var oFechaPago = respuesta.fechaPago;
                        var oIdOperacion = respuesta.codigo;
                        email('profesional',req.body,oIdOperacion,oFechaTransaccion,oFechaPago,function(res1){
                            console.log("enviando mail desde operacion nueva: ", res1);
                            console.log("mail cliente = ",req.body.mailCliente);
                            if(req.body.mailCliente != ''){
                                console.log("mail cliente no es vacio, mandando mail");
                                email('cliente',req.body,oIdOperacion,oFechaTransaccion,oFechaPago,function(res2){
                                    console.log("enviando mail desde operacion nueva: ", res2);
                                    let response = {
                                        'mysql' : consulta,
                                        'mailProfesional' : res1,
                                        'mailCliente' : res2,
                                        'MPComprobante':payment.response.id,
                                        'MPCodigo':'ok',
                                        'MP':'Pago Realizado Exitosamente'
                                    };
                                    console.log(response);
                                    res.json(response);
                                }); 
                            }else{
                                console.log("mail cliente vacio.. no se manda mail.. respondiendo solo mysql y mail prof");
                                let response = {
                                    'mysql' : consulta,
                                    'mailProfesional' : res1,
                                    'mailCliente' : 'error',
                                    'MPComprobante':payment.response.id,
                                    'MPCodigo':'ok',
                                    'MP':'Pago Realizado Exitosamente'
                                };
                                res.json(response);
                            }
                            
                        });
                    }else{
                        console.log("la op no se realizo, no se envian mails y se cancela",consulta);
                        let response = {
                            'mysql' : consulta,
                            'mailProfesional' : 'error',
                            'mailCliente' : 'error',
                            'MPComprobante':payment.response.id,
                            'MPCodigo':'ok',
                            'MP':'Pago Realizado Exitosamente'
                        };
                        res.json(response);
                    }
                });
        },
        (error)=> {
            let response = {
                'MPCodigo':'error',
                'MP':'El pago no se realizo. '+error
            };
            console.log(error);
            res.json(response);
    });
}

exports.excel = function(req, res, next){
    var nodeExcel=require('excel-export');
    var conf={}; //lleva la configuarcion de las columnas y filas
    arr=[]; // array donde se generan las filas
    var fechaInicio = '"'+req.params.fechaInicio+'"';
    var fechaFin = '"'+req.params.fechaFin+'"';
    conf.cols=[{
            caption:'DNI/CUIT Profesional',
            type:'number',
            width:101
        },
        {
            caption:'Fecha Transaccion',
            type:'string',
            width:90
        },
        {
            caption:'Fecha de Pago',
            type:'string',
            width:90
        },
        {
            caption:'DNI Cliente',
            type:'number',
            width:60
        },
        {
            caption:'APELLIDO Cliente',
            type:'string',
            width:90
        },
        {
            caption:'NOMBRE Cliente',
            type:'string',
            width:90
        },
        {
            caption:'Tarjeta',
            type:'string',
            width:45
        },
        {
            caption:'Importe de Venta',
            type:'number',
            width:85
        },
        {
            caption:'',
            type:'number',
            width:85
        },
        {
            caption:'Importe a Cobrar',
            type:'number',
            width:85
        },
        {
            caption:'Comision Profesional',
            type:'number',
            width:105
        },
        {
            caption:'COD AUTO N°',
            type:'number',
            width:70
        },
        {
            caption:'CUPON N°',
            type:'number',
            width:60
        },
        {
            caption:'Cuotas',
            type:'number',
            width:40
        },
        {
            caption:'Importe a Cargar',
            type:'number',
            width:85
        },
        {
            caption:'Importe Cuota',
            type:'number',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'Cod Interno',
            type:'number',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        {
            caption:'',
            type:'string',
            width:75
        },
        
        {
            caption:'Mail Cliente',
            type:'string',
            width:110
        },
        {
            caption:'Tel Cliente',
            type:'string',
            width:55
        },
        ];
        
    operacion.getOperacionesPorFecha(fechaInicio,fechaFin,function(consulta){
        let operaciones = consulta;
        console.log(operaciones);
        if(operaciones[0].codigo !== 0){
            for(i=0;i <operaciones.length;i++){
            codInterno = operaciones[i].idOperacion;
            cuit = operaciones[i].dniProfesional;
            fechaTransaccion = operaciones[i].fechaTransaccion;
            fechaPago = operaciones[i].fechaPago;
            dniCliente = operaciones[i].dniCliente;
            apellidoCliente = operaciones[i].apellidoCliente;
            nombreCliente = operaciones[i].nombreCliente;
            tarjeta = operaciones[i].tarjeta;
            importeVenta = operaciones[i].importeVenta;
            importeCobrar = operaciones[i].importeCobrar;
            importeVenta = parseFloat(importeVenta);
            importeCobrar = parseFloat(importeCobrar);
            comision  = importeVenta - importeCobrar;
            codigoAuto = operaciones[i].codigoAuto;
            cupon = operaciones[i].cupon;
            cuotas = operaciones[i].cuotas;
            importeCarga = operaciones[i].importeCarga;
            importeCuota = operaciones[i].importeCuota;
            mailCliente = operaciones[i].mailCliente;
            telefonoCliente = operaciones[i].telefonoCliente;

            fechaTransaccion = new Date(fechaTransaccion.getUTCFullYear(),
                                fechaTransaccion.getUTCMonth(),
                                fechaTransaccion.getUTCDate(),
                                fechaTransaccion.getUTCHours(),
                                fechaTransaccion.getUTCMinutes(),
                                fechaTransaccion.getUTCSeconds());

            fechaTransaccion = dateformat(fechaTransaccion,'dd/mm/yyyy H:MM');

            fechaPago = new Date(fechaPago.getUTCFullYear(),
                                fechaPago.getUTCMonth(),
                                fechaPago.getUTCDate(),
                                fechaPago.getUTCHours(),
                                fechaPago.getUTCMinutes(),
                                fechaPago.getUTCSeconds());

            fechaPago = dateformat(fechaPago,'dd/mm/yyyy');

            a=[cuit,fechaTransaccion,fechaPago,dniCliente,apellidoCliente,nombreCliente,tarjeta,importeVenta,3,importeCobrar,comision,codigoAuto,cupon,cuotas,importeCarga,importeCuota,'','',codInterno,'','','','','','','','',mailCliente,telefonoCliente,];
            arr.push(a);
            }

            conf.rows=arr; // armo el excel con todos los datos.

            var result=nodeExcel.execute(conf);
            res.setHeader('Content-Type','application/vnd.openxmlformates');
            res.setHeader("Content-Disposition","attachment;filename="+"Operaciones.xlsx");
            res.end(result,'binary');
        }else{
            res.json([{"codigo": 0,"mensaje":"No hay operaciones en ese rango"}])
        }
    }
    );  
}

var email = function (destino,operacion,oIdOperacion,oFechaTransaccion,oFechaPago,fn) {
    
    var oDniProfesional = operacion.dniProfesional;
    var oApellidoProfesional = operacion.apellidoProfesional;
    var oNombreProfesional = operacion.nombreProfesional;
    var oMailProfesional = operacion.mailProfesional;
    var oDniCliente = operacion.dniCliente;
    var oApellidoCliente = operacion.apellidoCliente;
    var oNombreCliente = operacion.nombreCliente;
    var oTelefonoCliente = operacion.telefonoCliente;
    var oMailCliente = operacion.mailCliente;
    var oTarjeta = operacion.tarjeta;
    var oImporteVenta = operacion.importeVenta;
    var oImporteCobrar = operacion.importeCobrar;
    var oCuotas = operacion.cuotas;
    var oImporteCarga = operacion.importeCarga;
    var oImporteCuota = operacion.importeCuota;
    var oCodigoAuto = operacion.codigoAuto;
    var oCupon = operacion.cupon;
    

    var pdf = require('html-pdf');
    // fs lee archivos
    var fs = require('fs');
    // embedd js para escribiri variables en html

    data = {
        'fechaImpresion': oFechaTransaccion,
        'dni': oDniProfesional,
        'apellido': oApellidoProfesional,
        'nombre': oNombreProfesional,
        'numOperacion': oIdOperacion,
        'mail': oMailProfesional,
        'cuitProfesional': oDniProfesional,
        'fechaPago': oFechaPago,
        'dniCliente': oDniCliente,
        'apellidoCliente': oApellidoCliente,
        'nombreCliente': oNombreCliente,
        'tarjeta': oTarjeta,
        'honorariosProfesional': oImporteVenta,
        'montoAcreditado': oImporteCobrar,
        'cuotas': oCuotas,
        'importeCuota': oImporteCuota,
        'codigoAuto': oCodigoAuto,
        'cupon': oCupon,
        'mailCliente': oMailCliente,
    }

    config = {
        "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
        "orientation": "portrait", // portrait or landscape  
        "zoomFactor": "1",
        "base": 'file:///home/backend/img/'
    }   

    switch(destino) {
        case 'profesional':
            var ejs = require('ejs')
            // , path = '/home/backend/views/tamplateProfesional.ejs'
            , path = '/Applications/XAMPP/xamppfiles/htdocs/chpaginaweb/testMP/backend/views/tamplateProfesional.ejs'
            , str = fs.readFileSync(path, 'utf8');
            var html = ejs.render(str,data);
            break;
        case 'cliente':
            var ejs = require('ejs')
            // , path = '/home/backend/views/tamplateCliente.ejs'
            , path = '/Applications/XAMPP/xamppfiles/htdocs/chpaginaweb/testMP/backend/views/tamplateCliente.ejs'
            , str = fs.readFileSync(path, 'utf8');
            var html = ejs.render(str,data);
            break;
        default:
    } 
    
  	var transporter = nodemailer.createTransport({
        host: 'xw000111.ferozo.com',
        port: 587,
        secure: false,
        auth: {
            user: 'op@clubhonorarios.com',
            pass: 'ch2017Astrid'
        }
        //  user: 'chonorarios@gmail.com',
        //  pass: 'ramiro123'
    });


    pdf.create(html, config).toStream(function(err, stream){
    switch(destino) {
        case 'profesional':
            var mailOptions = {
                from: 'Club Honorarios <op@clubhonorarios.com>', //grab form data from the request body object
                to: oMailProfesional,
                // bcc: 'pagos@clubhonorarios.com',// fl@clubhonorarios.com , diego.macian@soramus.com
                subject: 'Comprobante de transacción realizada',
                html: '<h3>Estimado Cliente:</h3>'+
                       '<p>A continuación adjuntamos el comprobante de la operación registrada en el día de hoy</p>'+
                        '<p>Estamos a su disposición, ante cualquier consulta que le surgiere</p>'+
                        '<p>Muchas gracias por confiar en nosotros.</p><br><br><br>'+
                        '<p>Saludos cordiales!</p>'+
                        '<img style="width: 250px; "src="cid:logo@png"/>'+
                        '<p>Astrid Arias Borquez</p>'+
                        '<p>Transaction Operation</p>'+
                        '<a href="http://www.clubhonorarios.com">www.clubhonorarios.com</a>'+
                        '<p>9 de Julio 485 1ºD /<a href="mailto:info@clubhonoraios.com">info@clubhonoraios.com</a> / Fijo: 0381-4207229 / Claro: 0381-155952597 / Personal:0381-153447459 / Movistar:0381-156034010</p>',
                attachments: [
                {   // stream as an attachment
                    // formato de nombre:
                    // Prof (nombre del profesional) - Cl (nombre del cliente) - Op (nro de la Operación correlativa que habría q definir por ejemplo desde 50.001) - fecha operación (dd-mm-aaaa). pdf
                    filename: 'Prof '+oApellidoProfesional.toUpperCase()+' '+oNombreProfesional+' - Cl '+oApellidoCliente.toUpperCase()+' '+oNombreCliente+' - Op '+oIdOperacion+' - '+oFechaTransaccion+'.pdf',
                    content: stream,
                },
                {
                    filename: 'logo.png',
                        path: '../backend/img/logo.png',
                        cid: 'logo@png' //same cid value as in the html img src
                }],
            };
            break;
        case 'cliente':
            var mailOptions = {
                from: 'Club Honorarios <op@clubhonorarios.com>', //grab form data from the request body object
                to: oMailCliente,
                subject: 'Comprobante de Operacion Numero '+oIdOperacion,
                text: 'Titular de la tarjeta: Se adjunto el comprobante de pago numero: '+oIdOperacion+' en formato PDF',
                attachments: [
                {   // stream as an attachment
                    // formato de nombre:
                    // Prof (nombre del profesional) - Cl (nombre del cliente) - Op (nro de la Operación correlativa que habría q definir por ejemplo desde 50.001) - fecha operación (dd-mm-aaaa). pdf
                    filename: 'Cl '+oApellidoCliente.toUpperCase()+' '+oNombreCliente+' - Prof '+oApellidoProfesional.toUpperCase()+' '+oNombreProfesional+' - Op '+oIdOperacion+' - '+oFechaTransaccion+'.pdf',
                    content: stream
                }],
            };
            break;
        default:
    }        
    transporter.sendMail(mailOptions,function(error, info){
        if(error){
            fn('error');
        }else{
            fn(info.response);
        };
      });
    });
}

exports.pdf = function(req, res, next){
    var pdf = require('html-pdf');
    // fs lee archivos
    var fs = require('fs');
    // embedd js para escribiri variables en html
    var ejs = require('ejs')
        // , path = __dirname + '/../views/tamplateProfesional.ejs'
        , path = '/home/backend/views/tamplateProfesional.ejs'
        , str = fs.readFileSync(path, 'utf8');

    console.log(path);

    data = {
        'fechaImpresion': 'hola',
        'dni': 'hola',
        'apellido': 'hola',
        'nombre': 'hola',
        'telefono': 'hola',
        'numOperacion': 'hola',
        'mail': 'hola',
        'cuitProfesional': 'hola',
        'fechaPago': 'hola',
        'dniCliente': 'hola',
        'apellidoCliente': 'hola',
        'nombreCliente': 'hola',
        'tarjeta': 'hola',
        'honorariosProfesional': 'hola',
        'montoAcreditado': 'hola',
    }
    var html = ejs.render(str,data);
    
    config = {
        "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
        "orientation": "portrait", // portrait or landscape  
        "zoomFactor": "1",
        "base": 'file:///home/backend/img/'
    }   

    pdf.create(html, config).toStream(function(err, stream){
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        stream.pipe(res);
    });
}


exports.crash = function(req, res, next){
    operacion.crash(function(consulta){
        res.json(consulta);
    });
}

// UNA MUESTRA CORRECTa de MANEJOS DE ERRORES

// exports.crash = function(req, res, next){
//     operacion.crash(function(consulta){
//         console.log(consulta.errno);
//         // SI HAY UN ERROR, LO MANDAMOS A IONIC CON CODIGO 0
//         if(consulta.errno){
//             // res.render('index', { title: 'ERROR!!!!!!' }); OPCIONAL PARA MOSTRAR UNA VISTA EN NODEJS.. SINO HACER LO DE ABAJO
//             console.log('[{"codigo": 1}]');
//             // ESTO DEVUELVE A IONIC LA CONSULTA CON CODIGO 0. PARA TRABAJAR COMO SE TRABAJA
//             res.json([{"codigo": 0}])
//         }else{
//             res.json(consulta);
//         }
        
//     });
// }


// exports.test = function(req, res, next){
//     var idOperacion = req.body.idOperacion;
//     operacion.test(idOperacion,function(consulta){
//         if(typeof consulta[0].codigo !== 'undefined' && consulta[0].codigo === 0){
//             console.log("cod = 0, TODO MAL");
//             res.json(consulta);
//         }else{
//             console.log("cod != de 0, TODO OK");
//             //agrego el codigo = 1 que MYSQL no devuelve, para q IONIC pueda leer siempre si el codigo es 0 o 1 para error o no
//             consulta[0].codigo = 1;
//             res.json(consulta);
//         }
//     });
// }