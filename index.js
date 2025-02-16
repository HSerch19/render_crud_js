//Librerias y dependencias
const http=require('http');
const express=require('express');
const app=express();
const sqlite3=require('sqlite3').verbose();
const path=require('path');

//Recursos
app.use(express.static(__dirname+'/'));

//Configuracion del servidor
app.set("view engine", "ejs"); //Establece el motor de plantilla, con archivos ejs
app.set("views", path.join(__dirname, "")); //Permite gestionar las rutas de los diferentes recursos de la app
app.use(express.urlencoded({extended:false})); //Permiten recuperar valores publicados en un request
app.listen(5000);
console.log("Servidor corriendo exitosamente en el puerto 5000")

//Base de Datos
const db_name=path.join(__dirname,"","base.db");
const db=new sqlite3.Database(db_name, err =>{ 
if (err){
	return console.error(err.message);
}else{
	console.log("Conexión exitosa con la base de Datos");
}
})

//Crear la tablas
const sql_create_table_categoria="CREATE TABLE IF NOT EXISTS Categorias (id INTEGER PRIMARY KEY AUTOINCREMENT,categoria TEXT)";

const sql_create_table_producto="CREATE TABLE IF NOT EXISTS Productos (id INTEGER PRIMARY KEY AUTOINCREMENT,codigo INTEGER,producto TEXT,categoria_id INTEGER,existencia_actual TEXT,precio REAL,FOREIGN KEY(categoria_id) REFERENCES categorias(id))";

db.run(sql_create_table_categoria,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Tabla Productos anexada correctamente");
}
})

db.run(sql_create_table_producto,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Tabla Categorias anexada correctamente");
}
})

//Creacion de Categorias
const sql_create_categorias="INSERT INTO Categorias (categoria) VALUES('Ropa'); INSERT INTO Categorias (categoria) VALUES('Accesorios'); INSERT INTO Categorias (categoria) VALUES('Recursos');";

db.run(sql_create_categorias,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Tabla Categorias fue llenada exitosamente");
}
})

//Enrutamiento
app.get('/',(req,res)=>{
	res.render('index.ejs')
})

app.get('/catalogo',(req,res)=>{
	res.render('index.ejs')
})

//Mostrar tabla de Productos
app.get('/productos',(req,res)=>{
	const sql="SELECT * FROM Productos ORDER BY codigo";
	db.all(sql, [],(err, rows)=>{
			if (err){
				return console.error(err.message);
			}else{
			res.render("Productos.ejs",{modelo:rows});
			}
	})
})


//mostrar tabla de Categorias
app.get('/categorias',(req,res)=>{
	const sql="SELECT c.id, c.categoria, COUNT(p.id) AS cantidad_productos FROM Categorias AS c LEFT JOIN Productos AS p ON c.id = p.categoria_id GROUP BY c.id, c.categoria";
	db.all(sql, [],(err, rows)=>{
		if (err){
			return console.error(err.message);
		}else{
		res.render("Categorias.ejs",{modelo:rows});
		}
	})
})


//Crear un nuevo Registro
app.get('/crear',(req,res)=>{
	res.render('crear.ejs',{modelo: {}})
});

//POST /crear
app.post('/crear',(req,res)=>{
	const sql="INSERT INTO Productos(producto, codigo ,categoria_id, existencia_actual, precio) VALUES(?,?,?,?,?)";
	//const nuevo_producto=["Laptop",1200, 2,"Agotado", 1200];
	const nuevo_producto=[req.body.producto, req.body.codigo, req.body.categoria_id, req.body.existencia_actual, req.body.precio];

	
	db.run(sql, nuevo_producto, err =>{
	if (err){
				return console.error(err.message);
			}
			else{
			res.redirect("/productos");
		}
	})
});
