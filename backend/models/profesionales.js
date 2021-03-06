var mysql = require('mysql');
var env = process.env.NODE_ENV || 'database',
    databaseConfig = require('./../config/' + env + '.js');

var pool = mysql.createPool({
    connectionLimit: 113,
    host: databaseConfig.host,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    timezone: 'utc'
});

exports.dameProfesional = function (dni, fn) {
    // console.log('desde el modelo',dni)
    pool.query('call profesionalTemp_dame(' + dni + ')', function (err, rows) {
        if (err) {
            consulta = [{ 'codigo': 0, 'mensaje': "Error numero: " + err.errno + " descripcion: " + err.message }]
            fn(consulta);
        } else fn(rows[0]);
    });
}

exports.bajaProfesional = function (idProfesional, fn) {
    pool.query('call profesionalTemp_baja(' + idProfesional + ')', function (err, rows) {
        if (err) {
            consulta = [{ 'codigo': 0, 'mensaje': "Error numero: " + err.errno + " descripcion: " + err.message }]
            fn(consulta);
        } else fn(rows[0]);
    });
}

exports.listarProfesionales = function (fn) {
    // console.log("entrado al modelo listarProf");
    pool.query('call profesionalTemp_listar()', function (err, rows) {
        if (err) {
            consulta = [{ 'codigo': 0, 'mensaje': "Error numero: " + err.errno + " descripcion: " + err.message }]
            fn(consulta);
        } else fn(rows[0]);
    });
}

exports.nuevoProfesional = function (fechaImpresion, dni, apellido, nombre, especialidad, domicilio, localidad, provincia,
    telefono, profesion, mail, vendedor, autorizado, dniAutorizado, fn) {
    pool.query('call profesionalTemp_nuevo(' + fechaImpresion + ',' + dni + ',' + apellido + ',' + nombre + ',' + especialidad + ',' +
        domicilio + ',' + localidad + ',' + provincia + ',' + telefono + ',' + profesion + ',' + mail + ',' + vendedor + ',' +
        autorizado + ',' + dniAutorizado + ')', function (err, rows) {
            if (err) {
                consulta = [{ 'codigo': 0, 'mensaje': "Error numero: " + err.errno + " descripcion: " + err.message }]
                fn(consulta);
            } else fn(rows[0]);
        });
}

exports.modificarProfesional = function (idProfesional, apellido, nombre, especialidad, domicilio, localidad, provincia,
    telefono, profesion, mail, vendedor, autorizado, dniAutorizado, fn) {
    pool.query('call profesionalTemp_modificar(' + idProfesional + ',' + apellido + ',' + nombre + ',' + especialidad + ',' +
        domicilio + ',' + localidad + ',' + provincia + ',' + telefono + ',' + profesion + ',' + mail + ',' + vendedor + ',' +
        autorizado + ',' + dniAutorizado + ')', function (err, rows) {
            if (err) {
                consulta = [{ 'codigo': 0, 'mensaje': "Error numero: " + err.errno + " descripcion: " + err.message }]
                fn(consulta);
            } else fn(rows[0]);
        });
}

exports.obtenerOpLiquidar = function (params, fn) {
    pool.query('call liquidacion_profesional_periodo( ?,?,?)', [params.dni, params.fechaInicio, params.fechaFin], function (err, rows) {
        if (err) fn(err);
        else fn(rows);
    });
}
exports.nuevaLiquidacion = function (params, fn) {
    pool.query('call liquidacion_nueva(?,?,?,?,?,?,?)', [params.idUsuario, params.idProfesional, params.montoTotal, params.cadena,params.cantidadRecibos,params.importeRecibos,params.conceptoRecibos], function (err, rows) {
        if (err) fn(err);
        else fn(rows);
    });
}

exports.getProfesionalesPorFecha = function (fechaInicio, fechaFin, fn) {
    pool.query('call profesionalTemp_listar_rango(' + fechaInicio + ',' + fechaFin + ')', function (err, rows) {
        if (err) fn(err);
        else fn(rows[0]);
    });
}

exports.dameProvincias = function (fn) {
    pool.query('call dame_provincias()', function (err, rows) {
        if (err) fn(err);
        else fn(rows[0]);
    });
}

exports.dameCiudades = function (idProvincia, fn) {
    pool.query('call dame_ciudades(' + idProvincia + ')', function (err, rows) {
        if (err) fn(err);
        else fn(rows[0]);
    });
}

