# VexaParts

Ik ga een webshop maken waarbij je pc onderdelen kan kopen (should have) en eventueel kan verkopen als gebruiker (could have). deze webshop gaat VexaParts heten. Dit vond ik wel een professionele en minimalistische naam voor mijn simplistische maar wel overzichtelijke design. 

## de functionaliteiten van de webshop zijn:
- dat hij online te bereiken is
- dat er minimaal 5 producten zijn die je kan kopen (zonder betalen)
- bij bestellen krijgt de klant een bevestiging van de bestelling
- de webshop moet een admin pagina hebben waar je producten kan aanmaken, verwijderen en wijzigen en resetten
- form-info moet worden gevalideerd
- producten in de winkelwagen opslaan in local storage

## Niet-functionele eisen
- De code is modulair opgebouwd
- De webshop is getest op fouten.
- De code is gedocumenteerd
- De code is 'clean' en leesbaar geschreven.
- De code is efficiënt.
- De webshop en het admin-gedeelte hebben een gebruiksvriendelijke interface.

## Design
    
Ik ga met de hand van FIGMA een design maken voor de webshop. deze ga ik dan implementeren in html/css en javascript als hij klaar is.

ik wil ervoor zorgen dat mijn design mooi overzichtelijk is en simplistisch zodat het rustig is aan de ogen en dat het makkelijk voor de klant is om er op te zoeken ik heb een andere webshop gevonden genaamd "megekko" en als je daarop kijkt zijn er veel te veel dingen op de homepagina waardoor het best onoverzichtelijk lijkt. terwijl als je het simplistisch maakt dan is alles veel overzichtelijker.

 het design bevat een hoofdpagina met daarop de producten die je kan kopen, een product pagina waarop je meer informatie kan vinden over het product met de optie om het in je winkelwagen te doen. Dan is er nog een admin pagina waar je producten kan aanmaken, verwijderen en wijzigen en resetten en 2 bewerk/toevoeg pagina's om producten toe te voegen/te bewerken.

# De kleuren
 de kleuren blauw en wit zijn vooral aanwezig want die paren goed met elkaar en zijn leuk om mee te werken.

# Link naar figma
linkje naar de figma design: https://www.figma.com/design/azHvfLNVdTI1unnV22z5RQ/webrookie-eindproject?node-id=25-138&t=rMZ9cibCp94jYbMn-1

## Wat is er allemaal geïmplementeerd?

### ✅ Homepage (index.html)
- Carousel met automatische slideshow van producten
- Best sellers sectie met populaire producten
- Navigatie naar alle pagina's
- Shopping cart modal systeem

### ✅ Producten Overzicht (parts.html)
- Product grid met alle beschikbare producten
- Filtering op categorie (CPU, GPU, Memory, Storage, etc.)
- Sortering op naam en prijs (oplopend/aflopend)
- Zoekfunctionaliteit in productnamen en specificaties
- "In winkelwagen" buttons voor elk product

### ✅ Product Detail (product.html)
- Gedetailleerde product informatie
- Technische specificaties
- Gerelateerde producten suggesties
- Breadcrumb navigatie
- Add to cart functionaliteit

### ✅ Shopping Cart
- Modal systeem voor winkelwagen
- Quantity management (+ en - buttons)
- Producten verwijderen uit winkelwagen
- Automatische prijsberekening
- "Winkelwagen legen" functionaliteit
- LocalStorage opslag (data blijft bewaard)

### ✅ Checkout (checkout.html)
- Volledig checkout formulier met validatie
- Order summary met alle producten
- Betalingssimulatie (success/failure rates)
- Success modal na bestelling
- Automatisch winkelwagen legen na succes

### ✅ Admin Panel (admin.html)
- Product toevoegen met formulier validatie
- Product bewerken via modal interface
- Product verwijderen met bevestiging
- Reset naar originele producten
- Wijzigingen opslaan in localStorage
- Real-time updates en notificaties

## Project structuur

```
The-Webshop-5e9bb8820470-e375a78bbe75/
├── public/
│   ├── index.html          # Homepage met carousel
│   ├── parts.html          # Producten overzicht
│   ├── product.html        # Product detail pagina
│   ├── checkout.html       # Afrekenen pagina
│   ├── admin.html          # Admin panel
│   ├── products.json       # Product database (10+ producten)
│   ├── js/
│   │   ├── app.js          # Carousel functionaliteit
│   │   ├── products.js     # Product laden en weergeven
│   │   ├── cart.js         # Winkelwagen systeem
│   │   ├── product-detail.js # Product detail pagina
│   │   ├── checkout.js     # Checkout proces
│   │   └── admin.js        # Admin functionaliteit
│   ├── src/
│   │   └── output.css      # Tailwind CSS
│   └── images/             # Product afbeeldingen
└── README.md               # Deze documentatie
```

## hoe installeer je de webshop lokaal?

### Methode 1: Direct openen
- clone de repo
- open de `public/index.html` in je browser
- klaar om te gebruiken!!

### Methode 2: Met live netlify server
voor gebruikers: https://vexparts2.netlify.app/
voor de administrator: https://vexparts2.netlify.app/admin.html


## hoe gebruik je de webshop?

### Voor klanten:
1. **Bekijk producten**: Ga naar "Parts" pagina
2. **Filter en zoek**: Gebruik de filters en zoekbalk
3. **Product details**: Klik "Lees meer" voor meer info
4. **Toevoegen aan winkelwagen**: Klik "In winkelwagen"
5. **Winkelwagen bekijken**: Klik op het winkelwagen icoon
6. **Afrekenen**: Ga naar checkout pagina
7. **Bestelling plaatsen**: Vul formulier in en bevestig

### Voor admins:
1. **Admin panel**: Ga naar `admin.html`
2. **Product toevoegen**: Vul het formulier in bovenaan
3. **Product bewerken**: Klik op het blauwe bewerk icoon
4. **Product verwijderen**: Klik op het rode prullenbak icoon
5. **Wijzigingen opslaan**: Klik "Wijzigingen Opslaan"
6. **Reset naar origineel**: Klik "Reset naar Origineel"

## technische details

### JavaScript bestanden:
- **app.js**: Carousel en navigatie
- **products.js**: Product laden, filteren, sorteren
- **cart.js**: Winkelwagen management
- **product-detail.js**: Product detail pagina
- **checkout.js**: Checkout proces en validatie
- **admin.js**: Admin CRUD operaties

### Data opslag:
- **products.json**: Product database
- **localStorage**: Winkelwagen en admin wijzigingen
- **Cache**: Producten worden 1 uur gecached

### Browser ondersteuning:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Geen IE ondersteuning

## Plan van aanpak
Ik ga eerst het design maken, dit kost mij 2 dagen. 
Dan ga ik deze implementeren in html/css dit kost mij een paar uur
Dan ga ik een json file maken met minimaal 5 producten die dan worden gegenereerd in de html met javascript
Dan ga ik bezig met de functionaliteiten van de webshop met de hand van Javascript en html voor de classes, id's en de functies
vervolgens ga ik de webshop testen en eventueel aanpassen
dan ga ik de webshop online zetten met netlify

## Planning 

| Dag | Taak | Status |
| --- | --- | --- |
| 28/03 - 31/04 | Design maken | ✅ Voltooid |
| 2/04 - 2/04| Design implementeren in html/css | ✅ Voltooid |
| 3/04 - 3/04 | Producten in de html genereren met javascript | ✅ Voltooid |
| 4/04 | functionaliteiten van de webshop met javascript | ✅ Voltooid |
| 5/04 - 7/04 | admin pagina maken en functioneel maken | ✅ Voltooid |
| 8/04 | Testen en eventueel aanpassen | ✅ Voltooid |
| 8/04 | Webshop online zetten met netlify | ✅ voltooid |

## wat werkt er allemaal?

### ✅ Volledig werkend:
- Homepage met carousel en best sellers
- Producten overzicht met filtering en sortering
- Product detail pagina's
- Shopping cart systeem
- Checkout proces met validatie
- Admin panel voor product beheer
- Responsive design voor alle apparaten
- LocalStorage data opslag
- Form validatie
- Error handling
- live op netlify : https://vexparts2.netlify.app/

### 🔄 Nog te doen:
- niets, alles is klaar!

## troubleshooting

### Problemen en oplossingen:
- **Producten laden niet**: Check of `products.json` bestaat
- **Winkelwagen werkt niet**: Clear localStorage en refresh
- **Admin panel laadt niet**: Check of alle JS bestanden geladen zijn
- **Styling ziet er raar uit**: Check of Tailwind CSS geladen is

### Browser console errors:
- Check de browser console (F12) voor error messages
- Refresh de pagina als er localStorage errors zijn
- Clear browser cache als er styling problemen zijn

---

**Status**: ✅ Volledig functioneel en klaar voor gebruik!
**Laatste update**: 18 juni 2025