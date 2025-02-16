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
const sql_create_table_categoria = "CREATE TABLE IF NOT EXISTS Categorias (id INTEGER PRIMARY KEY AUTOINCREMENT, categoria TEXT UNIQUE)"; // Añadimos UNIQUE a categoria

const sql_create_table_producto = "CREATE TABLE IF NOT EXISTS Productos (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo INTEGER, producto TEXT, categoria_id INTEGER, existencia_actual TEXT, precio REAL, FOREIGN KEY(categoria_id) REFERENCES categorias(id))";

db.run(sql_create_table_categoria, err => {
    if (err) {
        return console.error(err.message);
    } else {
        const sql_create_categorias_1 = "INSERT OR IGNORE INTO Categorias (categoria) VALUES('Ropa')"; // Usamos INSERT OR IGNORE
        const sql_create_categorias_2 = "INSERT OR IGNORE INTO Categorias (categoria) VALUES('Accesorios')"; // Usamos INSERT OR IGNORE
        const sql_create_categorias_3 = "INSERT OR IGNORE INTO Categorias (categoria) VALUES('Recursos')"; // Usamos INSERT OR IGNORE

        db.run(sql_create_categorias_1, err => {
            if (err) {
                return console.error(err.message);
            } else {
                console.log("Tabla Categorias fue llenada exitosamente, Ropa");
            }
        });

        db.run(sql_create_categorias_2, err => {
            if (err) {
                return console.error(err.message);
            } else {
                console.log("Tabla Categorias fue llenada exitosamente, Accesorios");
            }
        });

        db.run(sql_create_categorias_3, err => {
            if (err) {
                return console.error(err.message);
            } else {
                console.log("Tabla Categorias fue llenada exitosamente, Recursos");
            }
        });
    }
	console.log("Tabla Productos anexada correctamente");
});
	


db.run(sql_create_table_producto,err=>{
	if (err){
	return console.error(err.message);
}else{
	console.log("Tabla Categorias anexada correctamente");
}
})


//Enrutamiento
app.get('/',(req,res)=>{
	const sql="SELECT * FROM Productos ORDER BY id";
	db.all(sql, [],(err, rows)=>{
	if (err){
		return console.error(err.message);
	}else{
		res.render("catalogo.ejs",{modelo:rows});
	}
	})
})




app.get('/catalogo',(req,res)=>{
	const sql="SELECT * FROM Productos ORDER BY id";
	db.all(sql, [],(err, rows)=>{
	if (err){
		return console.error(err.message);
	}else{
		res.render("catalogo.ejs",{modelo:rows});
	}
	})
})

//Mostrar tabla de Productos
app.get('/productos', (req, res) => {
    const sql = "SELECT * FROM Productos ORDER BY codigo";

    db.all(sql, [], (err, productos) => {
        if (err) {
            return console.error(err.message);
        }

        db.all('SELECT * FROM Categorias', [], (err, categorias) => {
            if (err) {
                return console.error(err.message);
            }

            const categoriasMap = new Map();
            categorias.forEach(categoria => {
                categoriasMap.set(categoria.id, categoria.categoria);
            });

            res.render("productos.ejs", { modelo: productos, categoriasMap: categoriasMap });
        });
    });
});


//mostrar tabla de Categorias
app.get('/categorias',(req,res)=>{
		const sql="SELECT * FROM Categorias ORDER BY id";
		db.all(sql, [],(err, rows)=>{
		if (err){
			return console.error(err.message);
		}else{
			res.render("categorias.ejs",{modelo:rows});
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

//Editar Registros

//GET /edit/id
app.get("/editar/:id",(req, res)=>{
	const id=req.params.id;
	const sql="SELECT * FROM Productos WHERE id=?";
	db.get(sql,id,(err, rows)=>{
		res.render("editar.ejs",{modelo: rows})
	})
})

//POST /edit/id
app.post("/editar/:id",(req, res)=>{

	const id=req.params.id;
	const info_producto=[req.body.producto, req.body.codigo, req.body.categoria_id, req.body.existencia_actual, req.body.precio, id];
	const sql_actualizar="UPDATE Productos SET producto=?, codigo=? ,categoria_id=?, existencia_actual=?, precio=? WHERE (id=?)";


	db.run(sql_actualizar, info_producto, err =>{
			if (err){
				return console.error(err.message);
			}
			else{
					res.redirect("/productos");
		}
	});
})



// Eliminar Registros

//GET /eliminar/id
app.get("/eliminar/:id",(req, res)=>{
	const id=req.params.id;
	const sql="SELECT * FROM Productos WHERE id=?";
	db.get(sql,id,(err, rows)=>{
		res.render("eliminar.ejs",{modelo: rows})
	})
})



//POST /eliminar/id
app.post("/eliminar/:id",(req, res)=>{

	const id=req.params.id;
	const sql="DELETE FROM Productos WHERE id=?";

	db.run(sql, id, err =>{
			if (err){
				return console.error(err.message);
			}
			else{
					res.redirect("/productos");
		}
	});
})

//Compra de producto

app.get("/comprar/:id",(req, res)=>{
	const id=req.params.id;
	const sql="SELECT * FROM Productos WHERE id=?";
	db.get(sql,id,(err, rows)=>{
		res.render("comprar.ejs",{modelo: rows})
	})
})


app.post('/comprar/:id',(req,res)=>{
	res.render('comprarCentral.ejs')
})