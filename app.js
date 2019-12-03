const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
var session = require('express-session'); 
var router = express.Router();

var fs = require('fs');



app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public/images/shop')));
app.use(express.static(path.join(__dirname, 'public/images/blogs')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'scss')));
app.use(express.static(path.join(__dirname, 'js')));


app.use(fileUpload());
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

var connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password: "",
    database: "freshfruit"
})



app.get("/welcome", (req, res) => {
    connection.query("SELECT * FROM `shop` WHERE shop_id > 'SF00' AND shop_id < 'SF09'", (err, result) => { 
        res.render("welcome", { 
            posts:result
        });
        console.log(result); 
    })
});

app.get("/home", (req,res) => {
    if (req.session.loggedin) { 
    connection.query("SELECT * FROM `shop` WHERE shop_id > 'SF00' AND shop_id < 'SF09'", (err, result) => { 
        res.render("home", { 
            posts:result
        });
        console.log(result); 
    })}  else { 
        res.send("You must to login First!!!");
        console.log("You must to login First!!!");
    }
});

app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/contact", (req,res) => {
    res.render("contact");
});

app.get("/blog", (req,res) => {
    res.render("blog");
});  

app.get("/member", (req,res) => {
        connection.query("SELECT * FROM user", (err, result) => { 
            res.render("member.ejs", { 
                posts:result
            });
            console.log(result); 
        })
    });

//ใช้ id ในการกำหนด path ให้แบ่ง card 
app.get("/shop/:id", (req,res) => {

    var start = req.params.id
    let amount = 12
    let first = ( start - 1 ) * amount
    
    connection.query("SELECT * FROM `shop` LIMIT "+ first +"," + amount, (err, result) => { 
        res.render("shop.ejs", { 
            posts:result
        });
        console.log(result); 
    })
});

app.get("/regis", (req,res) => {
        res.render("regis");
    });
    
app.post("/regis", (req, res) => {
        let username_user = req.body.username_user;
        let email_user = req.body.email_user;
        let phone_user = req.body.phone_user;
        let password_user = req.body.password_user;
        
        let usernameQuery = "SELECT * FROM `user` WHERE username_user = '" + username_user + "'";
        connection.query(usernameQuery, (err, result) => {
            if (err) {
                res.send('error try again');
                console.log("error");
            }
            if (result.length > 0) {
                message = 'username already exists';
                res.render('regis.ejs', {
                    
        });
     } 

        let query = "INSERT INTO `user` ( `username_user`,`email_user`, `phone_user`, `password_user`) VALUES ('" + username_user + "','" +email_user + "','" + phone_user + "', '" + password_user + "')";
                        console.log(query);
                        connection.query(query, (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send('error try again');
                            }
                            console.log('query successful');
                             res.redirect('member');
                        });
                    });
});
            

app.post("/auth", function(request, response){
            var username_user = request.body.username_user ;
            var password_user = request.body.password_user; 

            if ( username_user && password_user ) { 
                connection.query( 
                    "SELECT * FROM user WHERE username_user = ? and password_user = ? ", 
                    [username_user, password_user], 
                    function(_error, results, _fields) {
                        if (results.length > 0) { 
                            request.session.loggedin = true;
                            request.session.username_user = username_user; 
                            response.redirect('/home');
                        }
                        else { 
                            response.send("incorrect username and/or password!"); 
                        }
                        response.end(); 
                    }
            );
            } else { 
                response.send("please enter username and password!"); 
                response.end(); 
            }
});


app.get("/:username_user/home",(req, res) =>{
            let username_user = req.params.username_user;

            connection.query("SELECT * FROM `user` WHERE username_user ='" + username_user + "'",(err,results)=>{
             res.render("home.ejs", {
                    posts:results
                });
                console.log(results);
            });
});




app.get("/shopwholesale/:id", (req,res) => {

    var start = req.params.id
    let amount = 12
    let first = ( start - 1 ) * amount
    
    connection.query("SELECT * FROM `shop` WHERE shop_type='ขายส่ง' LIMIT "+ first +"," + amount, (err, result) => { 
        res.render("shop-ws.ejs", { 
            posts:result
        });
        console.log(result); 
    })
});

app.get("/shopretail/:id", (req,res) => {
    
    var start = req.params.id
    let amount = 12
    let first = ( start - 1 ) * amount
    
    connection.query("SELECT * FROM `shop` WHERE shop_type='ขายปลีก' LIMIT "+ first +"," + amount, (err, result) => { 
        res.render("shop-rt.ejs", { 
            posts:result
        });
        console.log(result); 
    })
});


app.post("/cart", (req,res) => {
    
    let shop_name = req.params.shop_name;
    let shop_price = req.params.shop_price;

    let query = "INSERT INTO `cart` (`id_cart`, `name_cart`, `price_cart`) VALUES (NULL, '"+ shop_name +"', '"+ shop_price +"')"; 

        connection.query(query, (err, result) => {
            if (err) { 
                console.log("error");
            } else 
            { 
                res.render("cart", { 
                    posts : result
            })}
        });
        console.log(result); 
    });

app.get("/cart", (req,res) => {
    // let shop_name = req.params.shop_name;
    let query = "SELECT * from `cart`"; 
    connection.query(query, (err, result) => {
        if (err) { 
            res.send("error")
        } else { 
        res.render("cart.ejs", { 
            posts : result
         })};
         
        console.log(result); 
    });
});


app.get("/checkout", (req,res) => {
    res.render("checkout");
});

app.get("/product-single/:shop_id", (req,res) => {
    let shop_id = req.params.shop_id;
    connection.query("SELECT * FROM `shop` WHERE shop_id = '" + shop_id + "' ", (err, result) => { 
        res.render("product-single", { 
            posts : result[0]
         });
        console.log(result); 
        });
    }); 

app.get("/blog-single", (req,res) => {
    res.render("blog-single");
});


app.listen(4000);
console.log("running 4000");