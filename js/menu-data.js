/* =====================================================
   HERA THE GODDESS: MENU  (edit here)
   n = name, d = description, p = price in US dollars,
   sizes = [label, price] pairs for glasses and bottles,
   img = optional photo of the dish (for example "assets/menu/fokhara-steak.jpg").
   An item with no img simply shows without a photo.
   kind:"feature" makes large cards (used for the speciality and signature cocktails).
   ===================================================== */
const MENU = {
  food: [
    { id:"speciality", title:"Our Speciality", kind:"feature", sub:"Live station", items:[
      { n:"Fokhara Steak", d:"Live station, 500 g of Brazilian raw beef fillet served with fresh vegetables to be grilled on a served “fokhara”.", p:36, tag:"Live station" },
      { n:"Fokhara Chicken", d:"Live station, 500 g of breast chicken served with fresh vegetables to be grilled on a served “fokhara”.", p:30, tag:"Live station" },
      { n:"Fokhara Steak Tenderloin", d:"Live station, 500 g of tenderloin beef served with fresh vegetables to be grilled on a served “fokhara”.", p:45, tag:"Live station" }
    ]},
    { id:"appetizers", title:"Appetizers", items:[
      { n:"French Fries", d:"Served with ketchup", p:5 },
      { n:"Cheesy Fries", d:"Fries, cheddar topped with mix cheese sauce, jalapenos", p:9 },
      { n:"Potato Wedges", d:"Served with cocktail sauce", p:5 },
      { n:"Batata Harra", p:6 },
      { n:"Nachos", d:"Mixed cheese served with jalapeno, sweet chilly sauce, cheddar", p:12 },
      { n:"Edamame", d:"Served with soya sauce", p:6 },
      { n:"Kebbeh", d:"5 pcs", p:6 },
      { n:"Beef Sambousek", d:"5 pcs", p:6 },
      { n:"Cheese Rolls", d:"5 pcs", p:6 },
      { n:"Garlic Bread", d:"5 pcs, served with garlic, mixed cheese and oregano", p:7 },
      { n:"Mozzarella Sticks", d:"5 pcs of mozzarella served with cocktail sauce", p:7 },
      { n:"Shrimp Pané", d:"6 pcs of shrimps served with cocktail sauce", p:8 },
      { n:"Shrimp Provencal", d:"10 pcs of shrimps with fresh mushroom and sauce provencal", p:13 },
      { n:"Dynamite Shrimp", d:"6 pcs of shrimps served with dynamite sauce", p:13 },
      { n:"Hommos", p:5 },
      { n:"Sojok", d:"Tomato, bell pepper and lemon", p:8 },
      { n:"Makanek", d:"Served with debes el roman", p:8 },
      { n:"Spinach Dip", d:"Spinach, mushroom, mixed cheese, cream served with sliced bread", p:14 },
      { n:"Chicken Tenders", d:"5 pcs, served with barbecue sauce", p:9 },
      { n:"Truffle Fries", d:"Topped with truffle sauce and parmesan", p:9 },
      { n:"Jalapeno Cheese Ball", d:"5 pcs", p:7 },
      { n:"Chicken Quesadillas", d:"Served with fries and cheddar sauce", p:12 },
      { n:"Mini Burger Three in One", d:"3 mini burgers (beef, chicken, halloumi) served with fries and ketchup", p:14 },
      { n:"Chanklich", p:6 },
      { n:"Mushroom Pesto", d:"5 pcs", p:9 },
      { n:"Grilled Halloumi Bruschetta", d:"Grilled halloumi, tomato, pesto", p:9 },
      { n:"Chicken Popcorn", d:"10 pcs, served with cocktail sauce", p:6 },
      { n:"Shrimp Cocktail", d:"10 pcs of shrimp served with cocktail sauce", p:15 }
    ]},
    { id:"salads", title:"Salads", items:[
      { n:"Taboulé", p:6 },
      { n:"Fattouch", d:"Served with debs el remmen", p:6 },
      { n:"Chicken Caesar Salad", d:"Chicken, iceberg, crouton, parmesan served with caesar sauce", p:12 },
      { n:"Tuna Pasta Salad", d:"Fusilli pasta, corn, cherry tomato, olives, pepper, oregano, tuna served with caesar and pesto sauce", p:12 },
      { n:"Crab Salad", d:"Crab, carrot, cucumber, pineapple slices, avocado, black sesame, served with special sauce", p:13 },
      { n:"Greek Salad", d:"Iceberg, sliced cucumber, cherry tomato, bell pepper, oregano, red onion, olives and feta cheese", p:9 },
      { n:"Shrimps Avocado Salad", d:"Mixed lettuce, cherry tomato, cucumber, rocca, avocado and 10 pcs of shrimps served with cocktail sauce", p:16 },
      { n:"Rocca and Mushroom Salad", d:"Rocca, mushroom, parmesan, walnut, served with balsamic sauce", p:10 }
    ]},
    { id:"mains", title:"Main Courses", items:[
      { n:"Chicken Alfredo Pasta", d:"Tagliatelle pasta, grilled chicken, topped with mushroom sauce and parmesan cheese", p:14 },
      { n:"Pinky Shrimp Pasta", d:"Tagliatelle pasta, grilled shrimp, topped with mushroom sauce and parmesan cheese", p:16 },
      { n:"Chicken Cheesy Escalope", d:"Fried chicken breast served with lettuce, corn, mayo, mix cheese and french fries", p:17 },
      { n:"Grilled Chicken Mushroom", d:"2 pcs of grilled chicken breast, topped with mushroom sauce, sautéed vegetables, served with french fries or wedges", p:17 },
      { n:"Grilled Chicken Pesto", d:"2 pcs of grilled chicken breast, topped with pesto sauce, sautéed vegetables, served with french fries or wedges", p:18 },
      { n:"Grilled Steak Beef", d:"Beef tenderloin (300 g) topped with roux sauce served with sautéed vegetables and french fries", p:23 },
      { n:"Fish N Chips", d:"2 pcs of fish fillet pané with tartar sauce and lemon served with french fries", p:18 }
    ]},
    { id:"dessert", title:"Dessert", items:[
      { n:"Lazy Cake", p:6 }
    ]}
  ],
  drinks: [
    { id:"signature", title:"Signature Cocktails", kind:"feature", sub:"Made for Hera", items:[
      { n:"Divine Rose of Hera", d:"Fit for a goddess: vodka, Baileys, and strawberry in a luscious, regal embrace.", p:8 },
      { n:"Hera Oath", d:"Dark and defiant, Hera storms the night with bold tequila, challenging even the gods themselves.", p:8 },
      { n:"Hera’s Hunt", d:"Wrathful like Hera: Jägermeister and Campari ignite in a bitter, blazing citrus hunt.", p:8 },
      { n:"Hera’s Bloom", d:"Elegant and commanding like Hera: a floral, citrus-kissed blend crowned with a burning bloom.", p:8 }
    ]},
    { id:"cocktails", title:"International Cocktails", items:[
      { n:"Gin Basil", d:"Gin, sour mix, basil", p:7 },
      { n:"Negroni", d:"Gin, Campari, Martini Rosso", p:8 },
      { n:"Margarita", d:"Tequila, Cointreau, lemon juice", p:7 },
      { n:"Passion Fruit Martini", d:"Vodka, Passoa, passion fruit, sour mix", p:8 },
      { n:"Old Fashioned", d:"Bourbon whiskey, bitters, orange zest", p:8 },
      { n:"Moscow Mule", d:"Vodka, sour mix, ginger, soda", p:7 },
      { n:"Midori Sour", d:"Vodka, Midori, orange juice, sour mix", p:7 },
      { n:"Take Me Home", d:"Vodka, gin, blue curaçao, lemon", p:7 },
      { n:"Aperol Spritz", d:"Aperol, prosecco, soda", p:7 },
      { n:"Whisky Sour", d:"Bourbon whisky, orange bitter, sour mix", p:8 },
      { n:"Gin Sour", d:"Gin, aromatic bitter, sour mix", p:7 },
      { n:"Tequila Sour", d:"Tequila, sour mix", p:7 },
      { n:"Gin Thyme", d:"Gin infused, thyme, sour mix", p:8 },
      { n:"Long Island", d:"Vodka, gin, tequila, rum, triple sec, sour mix, Pepsi", p:8 },
      { n:"London Mule", d:"Gin, sour mix, ginger, soda", p:7 }
    ]},
    { id:"shots", title:"Shots", items:[
      { n:"Jägermeister", p:3.5 },
      { n:"Tequila Silver", p:3.5 },
      { n:"Doudou", p:3.5 },
      { n:"Tequila Gold", p:3.5 },
      { n:"Brain Damage", p:3.5 },
      { n:"B52", p:3.5 },
      { n:"Double Fusion", p:3.5 }
    ]},
    { id:"vodka", title:"Vodka", items:[
      { n:"Stolichnaya", sizes:[["Glass",5],["37 CL",22],["70 CL",32]] },
      { n:"Stolichnaya Gold", sizes:[["Glass",7],["Bottle",50]] },
      { n:"Russian Standard", sizes:[["Glass",6],["70 CL",36]] },
      { n:"Grey Goose", sizes:[["Glass",12],["70 CL",70]] }
    ]},
    { id:"gin", title:"Gin", items:[
      { n:"Gordon’s", sizes:[["Glass",6],["70 CL",32]] },
      { n:"Hendrick’s", sizes:[["Glass",8],["70 CL",70]] },
      { n:"Tanqueray", sizes:[["Glass",6],["70 CL",50]] }
    ]},
    { id:"whiskey", title:"Whiskey", items:[
      { n:"Red Label", sizes:[["Glass",5],["37 CL",25],["70 CL",48]] },
      { n:"Black Label", sizes:[["Glass",8],["37 CL",42],["70 CL",70]] },
      { n:"Chivas", sizes:[["Glass",6],["37 CL",36],["70 CL",60]] },
      { n:"Jameson", sizes:[["Glass",6],["Bottle",50]] },
      { n:"Glenfiddich 12Y", sizes:[["Glass",12],["70 CL",85]] }
    ]},
    { id:"wine", title:"Wine", items:[
      { n:"Ksara Sunset Rosé", sizes:[["Glass",6],["Bottle",20]] },
      { n:"Ksara Blanc de Blanc", sizes:[["Glass",6],["Bottle",20]] },
      { n:"Ksara Rouge", sizes:[["Glass",6],["Bottle",22]] }
    ]},
    { id:"prosecco", title:"Prosecco", items:[
      { n:"Martini", sizes:[["Glass",6],["75 CL",35]] },
      { n:"Piccini", sizes:[["Glass",5],["75 CL",30]] },
      { n:"Gancia", sizes:[["Glass",6],["75 CL",35]] }
    ]},
    { id:"beer", title:"Beer", items:[
      { n:"Almaza Regular", p:4 },
      { n:"Almaza Mexican", p:5 },
      { n:"Almaza Light", p:4.5 }
    ]},
    { id:"soft", title:"Soft Drinks", items:[
      { n:"Small Water", p:1 },
      { n:"Pepsi", p:2 },
      { n:"7up", p:2 },
      { n:"Mirinda", p:2 },
      { n:"Boom Boom", p:3 },
      { n:"Perrier", p:3 }
    ]}
  ],
  shisha: [
    { id:"shisha", title:"Shisha", items:[
      { n:"Shisha", p:7 },
      { n:"Add-on Shisha", p:5 }
    ]}
  ]
};
