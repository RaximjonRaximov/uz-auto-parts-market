"""Seed sample data for development and demos."""
from __future__ import annotations

import random
from typing import Any, Dict, List

from app.db import SessionLocal
from app.models import Brand, Category, Model, Part, Seller, ServiceCenter

_UZS_TO_USD = 12_500.0

_BRANDS: Dict[str, List[str]] = {
    "Chevrolet": ["Nexia", "Cobalt", "Spark", "Lacetti", "Damas", "Malibu", "Captiva", "Tracker", "Equinox"],
    "Kia": ["Rio", "K5", "Sportage", "Sorento", "Cerato", "Optima", "Ceed", "Soul"],
    "Hyundai": ["Accent", "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta", "i20", "i30"],
    "Toyota": ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Prado", "Yaris"],
    "Daewoo": ["Matiz", "Nexia", "Gentra", "Damaz"],
    "BYD": ["Song", "Chazor", "E2", "E3", "Seal", "Dolphin"],
    "Haval": ["H6", "Jolion", "Dargo", "F7", "H9"],
    "Lada": ["Vesta", "Granta", "Niva", "XRay", "Priora"],
    "BMW": ["E39", "E46", "F10", "X5", "X3", "X6", "G30"],
    "Mercedes-Benz": ["W124", "W210", "W211", "Sprinter", "G-Class", "C-Class", "E-Class"],
    "Audi": ["A4", "A6", "Q5", "Q7", "A3", "A8"],
    "Volkswagen": ["Polo", "Jetta", "Tiguan", "Passat", "Golf", "Touareg"],
    "Skoda": ["Octavia", "Superb", "Kodiaq", "Rapid", "Karoq"],
    "Renault": ["Logan", "Duster", "Kaptur", "Sandero"],
    "Chery": ["Tiggo 7", "Tiggo 8", "Arrizo", "QQ"],
}

_CATEGORIES = [
    "Dvigatel",
    "Transmissiya",
    "Xodovoy",
    "Kuzov",
    "Elektrika",
    "Salon",
    "Detali dvigatelya",
    "Tormoz tizimi",
    "Radiator va salnik",
    "Shinalar va disklar",
    "Akumulyator",
    "Moy va ximiya",
    "Filtrlar",
    "Konditsioner",
    "Zapchasti",
]

_CONDITIONS = ["new", "used", "remanufactured"]

_REGIONS: Dict[str, List[str]] = {
    "Toshkent": ["Yunusobod", "Shayxontohur", "Mirabad", "Yashnobod", "Chilonzor", "Bektemir", "Sergeli", "Yakkasaroy"],
    "Toshkent viloyati": ["Chirchiq", "Yangiyo‘l", "Angren", "Bekobod", "Olmaliq"],
    "Samarqand": ["Samarqand shahri", "Urgut", "Jomboy", "Kattaqo‘rg‘on"],
    "Buxoro": ["Buxoro shahri", "G‘ijduvon", "Kogon", "Qorako‘l"],
    "Andijon": ["Andijon shahri", "Asaka", "Shahrixon", "Marhamat"],
    "Farg‘ona": ["Farg‘ona shahri", "Qo‘qon", "Marg‘ilon", "Rishton"],
    "Namangan": ["Namangan shahri", "Chortoq", "Pop", "Uychi"],
    "Xorazm": ["Urganch", "Xiva", "Gurlan", "Shovot"],
    "Qashqadaryo": ["Qarshi", "Shahrisabz", "Kitob", "Koson"],
    "Surxondaryo": ["Termiz", "Denov", "Sherobod", "Sariosiyo"],
    "Navoiy": ["Navoiy shahri", "Zarafshon", "Uchquduq", "Konimex"],
    "Jizzax": ["Jizzax shahri", "Arnasoy", "Forish", "Zomin"],
    "Sirdaryo": ["Guliston", "Sirdaryo", "Oqoltin", "Xovos"],
    "Qoraqalpog‘iston": ["Nukus", "Xo‘jayli", "To‘rtko‘l", "Qong‘irot"],
}

# Approximate region centers for demo geocoding
_REGION_COORDS: Dict[str, tuple[float, float]] = {
    "Toshkent": (41.2995, 69.2401),
    "Toshkent viloyati": (41.2950, 69.6500),
    "Samarqand": (39.6542, 66.9597),
    "Buxoro": (39.7680, 64.4556),
    "Andijon": (40.7829, 72.3442),
    "Farg‘ona": (40.3842, 71.7843),
    "Namangan": (40.9983, 71.5801),
    "Xorazm": (41.5504, 60.6291),
    "Qashqadaryo": (38.8606, 65.7890),
    "Surxondaryo": (37.2242, 67.2783),
    "Navoiy": (40.1044, 65.3688),
    "Jizzax": (40.1158, 67.8422),
    "Sirdaryo": (40.3864, 68.7155),
    "Qoraqalpog‘iston": (42.4603, 59.6079),
}

_PART_TITLES: Dict[str, List[str]] = {
    "Dvigatel": ["Dvigatel", "Dvigatel blok", "Porshen", "Kolenval", "Golovka bloki", "Yag silindrlar"],
    "Transmissiya": ["KPP", "Avtomat karobka", "Sceplenie", "Kardan", "Reduktor", "Variador"],
    "Xodovoy": ["Amortizator", "Prujina", "Rychag", "Stupitsa", "Sharovaya opora", "Stabilizator"],
    "Kuzov": ["Bamper", "Krilo", "Kaput", "Dver", "Fara", "Zadniy fonar", "Zerkalo"],
    "Elektrika": ["Generator", "Starter", "Fara bloor", "Provodka", "Datchik", "Akkumulyator"],
    "Salon": ["Sideniya", "Rul", "Panel priborov", "Kovrik", "Obivka", "Potolok"],
    "Detali dvigatelya": ["Raspredval", "Maslyaniy nasos", "Vodanoy nasos", "Remen GRM", "Termostat", "Podshipnik"],
    "Tormoz tizimi": ["Tormoz disk", "Kolodki", "Tormoz silindr", "ABS datchik", "Tormoz shlang"],
    "Radiator va salnik": ["Radiator", "Salnik", "Patrubok", "Ventilyator", "Rasshiritel"],
    "Shinalar va disklar": ["Shina", "Disk", "Kolpachok", "Zimniy shina", "Letniy shina"],
    "Akumulyator": ["Akumulyator 60Ah", "Akumulyator 75Ah", "Akumulyator 90Ah", "Akumulyator 100Ah"],
    "Moy va ximiya": ["Mator moyi", "Transmissiya moyi", "Tormoz suyuqligi", "Antifriz", "Ochistitel"],
    "Filtrlar": ["Moy filtr", "Havo filtr", "Yoqilg'i filtr", "Salon filtr", "Gidravlik filtr"],
    "Konditsioner": ["Konditsioner kompressor", "Rul trubkasi", "Frezon", "Isitish radatori"],
    "Zapchasti": ["Remkomplekt", "Podshipnik", "Svecha", "Rezinka", "Bolta gajka", "Krepej"],
}

_SERVICE_NAMES = [
    "Avtoservis 24", "Pro Auto Service", "Avto Tex Xizmat", "Mega Service", "Premium Avto",
    "Usta Avto", "AvtoKlub", "Fast Service", "AvtoLider", "AvtoDoktor", "Gold Service",
    "AvtoMaks", "City Service", "AvtoRemont", "Trust Auto", "AvtoSity", "Ideal Service",
    "AvtoMasters", "AvtoGarant", "AutoLine", "AvtoExpert", "Vip Service", "AvtoMir",
    "AvtoPlaneta", "AvtoPride", "AvtoStart", "AvtoVera", "AvtoComfort", "AvtoHimchistka",
    "AvtoDetailing", "Tires Plus", "AvtoShina", "AvtoAkumulyator", "AvtoElektrik",
]

_SELLER_NAMES = [
    "Avtozapchast.uz", "ZapchastiToshkent", "AvtoMarkaz", "Asl zapchast", "Original Parts",
    "AvtoLider", "Mega Zapchast", "AvtoSklad", "AvtoMagazin", "Fast Parts", "AvtoOptom",
    "Zapchasti Online", "AvtoImport", "AvtoBaza", "AvtoPlus", "UzAutoParts", "AvtoCity",
    "AvtoTrust", "AvtoGarant", "AvtoGrand", "AvtoKlass", "AvtoKomfort", "AvtoImperial",
    "AvtoPremium", "AvtoUniversal", "AvtoXit", "AvtoSiti", "AvtoMir", "AvtoLuxe",
    "AvtoBrend", "AvtoDinamo", "AvtoElit", "AvtoForum", "AvtoGlobal", "AvtoInvest",
    "AvtoJahon", "AvtoKapitol", "AvtoLeader", "AvtoMax", "AvtoNur", "AvtoOlam",
    "AvtoPoytaxt", "AvtoQalampir", "AvtoRavnaq", "AvtoSabantuy", "AvtoTaraqqiyot",
    "AvtoUmid", "AvtoVatan", "AvtoYulduz", "AvtoZiyo",
]

_SERVICE_TYPES = [
    "Diagnostika", "Dvigatel ta'miri", "Transmissiya ta'miri", "Tormoz tizimi", "Xodovoy ta'mir",
    "Kuzov ishlar", "Elektr tizimlari", "Konditsioner", "Shina o'rnatish", "Akumulyator",
    "Ximchistka", "Detailing", "Avtoelektrik", "Chilangar xizmati",
]


def _phone() -> str:
    prefixes = ["90", "91", "93", "94", "95", "97", "98", "99", "88", "33"]
    return f"+998 {random.choice(prefixes)} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}"


def _seed_brands(db) -> Dict[str, int]:
    brand_ids = {}
    for name, models in _BRANDS.items():
        brand = db.query(Brand).filter(Brand.name == name).first()
        if not brand:
            brand = Brand(
                name=name,
                slug=name.lower().replace(" ", "-"),
                country="Various",
                popular=1 if name in {"Chevrolet", "Kia", "Hyundai", "BYD", "Haval"} else 0,
            )
            db.add(brand)
            db.flush()
        brand_ids[name] = brand.id
        for model_name in models:
            if not db.query(Model).filter(Model.brand_id == brand.id, Model.name == model_name).first():
                year_start = random.choice([2000, 2005, 2010, 2015, 2018])
                year_end = year_start + random.randint(5, 15)
                db.add(Model(
                    brand_id=brand.id,
                    name=model_name,
                    slug=f"{brand.slug}-{model_name.lower().replace(' ', '-')}",
                    year_start=year_start,
                    year_end=min(year_end, 2025),
                    body_types=random.choice(["sedan", "hatchback", "SUV", "universal"]),
                    engine_types=random.choice(["1.5", "1.6", "2.0", "2.4"]),
                ))
    db.commit()
    return brand_ids


def _seed_categories(db) -> None:
    for name in _CATEGORIES:
        if not db.query(Category).filter(Category.name == name).first():
            db.add(Category(
                name=name,
                slug=name.lower().replace(" ", "-").replace("'", ""),
                icon="wrench",
                description=f"{name} kategoriyasidagi avto ehtiyot qismlari",
            ))
    db.commit()


def _seed_sellers(db, count: int = 60) -> None:
    if db.query(Seller).first():
        return
    for i in range(count):
        region = random.choice(list(_REGIONS.keys()))
        city = random.choice(_REGIONS[region])
        lat, lng = _REGION_COORDS[region]
        lat += random.uniform(-0.08, 0.08)
        lng += random.uniform(-0.08, 0.08)
        brands = ", ".join(random.sample(list(_BRANDS.keys()), k=random.randint(2, 5)))
        db.add(Seller(
            name=random.choice(_SELLER_NAMES) if i < len(_SELLER_NAMES) else f"Sotuvchi {i+1}",
            type=random.choice(["shop", "individual", "service"]),
            phone=_phone(),
            email=f"info{i}@example.uz" if random.random() > 0.7 else None,
            address=f"{city}, {region}",
            city=city,
            region=region,
            lat=lat,
            lng=lng,
            logo_url=None,
            rating=round(random.uniform(3.5, 5.0), 1),
            verified=1 if random.random() > 0.3 else 0,
            work_hours="Dush-Shan 09:00-18:00" if random.random() > 0.5 else None,
            brands=brands,
            services=None,
        ))
    db.commit()


def _seed_service_centers(db, count: int = 40) -> None:
    if db.query(ServiceCenter).first():
        return
    for i in range(count):
        region = random.choice(list(_REGIONS.keys()))
        city = random.choice(_REGIONS[region])
        lat, lng = _REGION_COORDS[region]
        lat += random.uniform(-0.06, 0.06)
        lng += random.uniform(-0.06, 0.06)
        services = random.sample(_SERVICE_TYPES, k=random.randint(3, 8))
        brands = ", ".join(random.sample(list(_BRANDS.keys()), k=random.randint(2, 5)))
        db.add(ServiceCenter(
            name=random.choice(_SERVICE_NAMES) if i < len(_SERVICE_NAMES) else f"Avtoservis {i+1}",
            services=", ".join(services),
            address=f"{city}, {region}",
            city=city,
            region=region,
            lat=lat,
            lng=lng,
            phone=_phone(),
            work_hours="Dush-Shan 08:00-20:00",
            brands=brands,
            rating=round(random.uniform(3.0, 5.0), 1),
        ))
    db.commit()


def _seed_parts(db, count: int = 500) -> None:
    if db.query(Part).first():
        return
    random.seed(42)
    brands = db.query(Brand).all()
    brand_map = {b.name: b.id for b in brands}
    model_map = {}
    for model in db.query(Model).all():
        model_map.setdefault(model.brand_id, []).append(model)

    parts: list[dict[str, Any]] = []
    for i in range(1, count + 1):
        brand_name = random.choice(list(_BRANDS.keys()))
        model_name = random.choice(_BRANDS[brand_name])
        brand_id = brand_map[brand_name]
        model_obj = random.choice([m for m in model_map.get(brand_id, []) if m.name == model_name] or model_map.get(brand_id, []))
        model_id = model_obj.id if model_obj else None
        year = random.randint(max(2000, model_obj.year_start or 2000) if model_obj else 2000, min(2024, model_obj.year_end or 2024) if model_obj else 2024)
        category = random.choice(_CATEGORIES)
        condition = random.choice(_CONDITIONS)
        region = random.choice(list(_REGIONS.keys()))
        city = random.choice(_REGIONS[region])

        base_price = random.randint(80_000, 8_000_000)
        if condition == "new":
            base_price = int(base_price * 1.35)
        elif condition == "remanufactured":
            base_price = int(base_price * 0.75)
        if region == "Toshkent":
            base_price = int(base_price * 1.1)
        base_price = round(base_price / 1_000) * 1_000

        title_choices = _PART_TITLES.get(category, ["Zapchast"])
        title = f"{random.choice(title_choices)} {brand_name} {model_name} {year}"
        if condition == "new":
            title = "Yangi " + title.lower()
        elif condition == "remanufactured":
            title = "Tiklangan " + title.lower()

        description = (
            f"{title}. {condition} holatda. "
            f"{brand_name} {model_name} {year} uchun mos. "
            f"Sotuvchi: {random.choice(['Avto zapchast', 'Usta', 'Shaxsiy', 'Magazin'])}."
        )

        image_url = f"https://placehold.co/640x480/e2e8f0/1e293b?text={i}"

        parts.append({
            "external_id": f"part-{i:04d}",
            "title": title.capitalize(),
            "description": description,
            "brand": brand_name,
            "model": model_name,
            "year": year,
            "category": category,
            "condition": condition,
            "price_uzs": base_price,
            "price_usd": round(base_price / _UZS_TO_USD, 2),
            "currency": "UZS",
            "region": region,
            "city": city,
            "seller_name": f"Sotuvchi {i}",
            "seller_phone": _phone(),
            "image_url": image_url,
            "is_active": 1,
            "brand_id": brand_id,
            "model_id": model_id,
        })

    for item in parts:
        db.add(Part(**item))
    db.commit()


def seed_all() -> None:
    db = SessionLocal()
    try:
        _seed_brands(db)
        _seed_categories(db)
        _seed_sellers(db)
        _seed_service_centers(db)
        _seed_parts(db)
    finally:
        db.close()
