import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { publicDb } from "../firebase";

type Category =
  | "Combos"
  | "Tradicionais"
  | "Especiais"
  | "Baguetes & hot dog"
  | "Pastéis"
  | "Panquecas & espaguetes"
  | "Porções & bebidas";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  tag?: string;
  options?: string[];
  optionPrices?: Record<string, number>;
  image?: string;
};

type CartItem = Product & { quantity: number; option?: string };
type StoreSettings = { name: string; color: string };

const LOGO_PATH = "/logo-lanchao-massa.png";
const DEFAULT_STORE: StoreSettings = { name: "Lanchão Massa", color: "#ee5b28" };

const productImages: Record<string, string> = {
  "combo-super": "/products/combo-super.jpg",
  "combo-x-gigante": "/products/combo-x-gigante.jpg",
  "combo-trad-duplo": "/products/combo-trad-duplo.jpg",
  "combo-x-tudo": "/products/combo-x-tudo.jpg",
  "combo-baguete-calabresa": "/products/combo-baguete-calabresa.jpg",
  "combo-baguete-frango": "/products/combo-baguete-frango.jpg",
  "combo-especial": "/products/combo-01-especial.jpg",
  tradicional: "/products/tradicional.jpg",
  "trad-calabresa-frango": "/products/trad-calabresa-frango.jpg",
  "x-salada": "/products/x-salada.jpg",
  "x-bacon": "/products/x-bacon.jpg",
  especial: "/products/especial.jpg",
  "esp-calabresa-frango": "/products/esp-calabresa-frango.jpg",
  "esp-x-tudo": "/products/esp-x-tudo.jpg",
  gigante: "/products/gigante.jpg",
  "baguete-frango-calabresa": "/products/baguete-frango-calabresa.jpg",
  "mega-hot-dog": "/products/mega-hot-dog.jpg",
  "pastel-misto": "/products/pastel-misto.jpg",
  "pastel-sabores": "/products/pastel-sabores.jpg",
  "pastel-queijo-coalho": "/products/pastel-queijo-coalho.jpg",
  "pastel-camarao": "/products/pastel-camarao.jpg",
  panqueca: "/products/panqueca.jpg",
  espaguete: "/products/espaguete.jpg",
  batata: "/products/batata.jpg",
  suco: "/products/suco.jpg",
  "refri-lata": "/products/refri-lata.jpg",
  agua: "/products/agua.jpg",
};

const WHATSAPP_NUMBER = "5583981053745";
const OPENING_TIME = "17:30";
const CLOSING_TIME = "00:00";

const categories: { label: string; value: Category | "Todos" }[] = [
  { label: "Todos", value: "Todos" },
  { label: "Combos", value: "Combos" },
  { label: "Hambúrgueres tradicionais", value: "Tradicionais" },
  { label: "Hambúrgueres especiais", value: "Especiais" },
  { label: "Baguetes & hot dog", value: "Baguetes & hot dog" },
  { label: "Pastéis", value: "Pastéis" },
  { label: "Panquecas & espaguetes", value: "Panquecas & espaguetes" },
  { label: "Porções & bebidas", value: "Porções & bebidas" },
];

const products: Product[] = [
  {
    id: "combo-super",
    name: "Super combo artesanal",
    description: "Lanche artesanal, batata frita e refrigerante.",
    price: 29.99,
    category: "Combos",
    tag: "Mais pedido",
  },
  {
    id: "combo-x-gigante",
    name: "Combo 06 · Especial gigante 1 kg",
    description: "Hambúrguer gigante de 1 kg, batata frita e bebida.",
    price: 45,
    category: "Combos",
  },
  {
    id: "combo-trad-duplo",
    name: "Combo 05 · Trad. X-Duplo",
    description: "X-Duplo tradicional com batata e refrigerante.",
    price: 27,
    category: "Combos",
  },
  {
    id: "combo-x-tudo",
    name: "Combo 04 · X-Tudo",
    description: "X-Tudo completo com batata e refrigerante.",
    price: 35,
    category: "Combos",
  },
  {
    id: "combo-baguete-calabresa",
    name: "Combo 03 · Baguete calabresa",
    description: "Baguete de calabresa com acompanhamento e bebida.",
    price: 30,
    category: "Combos",
  },
  {
    id: "combo-baguete-frango",
    name: "Combo 02 · Baguete frango",
    description: "Baguete de frango com acompanhamento e bebida.",
    price: 30,
    category: "Combos",
  },
  {
    id: "combo-especial",
    name: "Combo 01 · Especial",
    description: "Lanche especial, batata frita e refrigerante.",
    price: 30,
    category: "Combos",
  },
  {
    id: "tradicional",
    name: "Tradicional",
    description: "Pão, carne, queijo, presunto, tomate, alface e molho especial.",
    price: 12,
    category: "Tradicionais",
  },
  {
    id: "trad-calabresa-frango",
    name: "Calabresa / frango",
    description: "Escolha calabresa ou frango, com queijo, salada e molho da casa.",
    price: 15,
    category: "Tradicionais",
    options: ["Calabresa", "Frango"],
  },
  {
    id: "x-salada",
    name: "X-Tudo tradicional",
    description: "Carne, queijo, presunto, salada fresca e molho especial.",
    price: 17,
    category: "Tradicionais",
  },
  {
    id: "x-bacon",
    name: "Frango tradicional",
    description: "Frango, queijo, salada fresca e molho especial.",
    price: 15,
    category: "Tradicionais",
  },
  {
    id: "especial",
    name: "Especial",
    description: "Lanche especial com carne, queijo, presunto, bacon e salada.",
    price: 20,
    category: "Especiais",
    tag: "Favorito",
  },
  {
    id: "esp-calabresa-frango",
    name: "Calabresa / frango",
    description: "Versão especial com calabresa ou frango, queijo e complementos.",
    price: 25,
    category: "Especiais",
    options: ["Calabresa", "Frango"],
  },
  {
    id: "esp-x-tudo",
    name: "X-Tudo",
    description: "Carne, queijo, presunto, bacon, calabresa, ovo, salada e molho.",
    price: 30,
    category: "Especiais",
  },
  {
    id: "gigante",
    name: "Gigante",
    description: "O maior da casa, recheado com os melhores complementos.",
    price: 35,
    category: "Especiais",
  },
  {
    id: "baguete-frango-calabresa",
    name: "Baguete frango / calabresa",
    description: "Baguete assada, recheio cremoso, queijo e molho da casa.",
    price: 22,
    category: "Baguetes & hot dog",
    options: ["Frango", "Calabresa"],
  },
  {
    id: "mega-hot-dog",
    name: "Hot dog carne / frango",
    description: "Pão macio, recheio da casa, milho, batata palha e molhos.",
    price: 20,
    category: "Baguetes & hot dog",
    options: ["Carne", "Frango"],
  },
  {
    id: "pastel-misto",
    name: "Pastel misto",
    description: "Presunto e queijo em massa sequinha e crocante.",
    price: 8,
    category: "Pastéis",
  },
  {
    id: "pastel-sabores",
    name: "Pastel pizza / frango / calabresa / carne",
    description: "Escolha seu recheio favorito entre os sabores da casa.",
    price: 10,
    category: "Pastéis",
    options: ["Pizza", "Frango", "Calabresa", "Carne"],
  },
  {
    id: "pastel-queijo-coalho",
    name: "Pastel queijo coalho / catupiry",
    description: "Recheio cremoso e queijo coalho dourado.",
    price: 12,
    category: "Pastéis",
  },
  {
    id: "pastel-camarao",
    name: "Pastel de camarão",
    description: "Camarão temperado em massa crocante.",
    price: 18,
    category: "Pastéis",
  },
  {
    id: "panqueca",
    name: "Panqueca carne / frango",
    description: "Panqueca recheada, molho especial e queijo gratinado.",
    price: 16,
    category: "Panquecas & espaguetes",
    options: ["Carne", "Frango"],
    optionPrices: { Carne: 16, Frango: 17 },
    tag: "A partir de",
  },
  {
    id: "espaguete",
    name: "Espaguete carne / frango",
    description: "Massa ao molho da casa com opção de carne ou frango.",
    price: 17,
    category: "Panquecas & espaguetes",
    options: ["Carne", "Frango"],
    optionPrices: { Carne: 17, Frango: 18 },
    tag: "A partir de",
  },
  {
    id: "batata",
    name: "Batata frita",
    description: "Porção dourada e crocante para compartilhar.",
    price: 10,
    category: "Porções & bebidas",
    tag: "A partir de",
  },
  {
    id: "suco",
    name: "Suco natural 500 ml",
    description: "Consulte os sabores disponíveis no dia.",
    price: 6,
    category: "Porções & bebidas",
    options: ["Acerola", "Abacaxi", "Maracujá", "Goiaba"],
  },
  {
    id: "refri-lata",
    name: "Refrigerante lata",
    description: "Consulte as opções disponíveis.",
    price: 6,
    category: "Porções & bebidas",
    options: ["Coca-Cola", "Guaraná", "Fanta"],
  },
  {
    id: "agua",
    name: "Água mineral",
    description: "Garrafa individual gelada.",
    price: 5,
    category: "Porções & bebidas",
  },
];

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const isOpenNow = () => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= 17 * 60 + 30 && currentMinutes < 24 * 60;
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "Todos">("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro" | "">("");
  const [needsChange, setNeedsChange] = useState<"sim" | "nao" | "">("");
  const [changeFor, setChangeFor] = useState("");
  const [isOpen] = useState(isOpenNow);
  const [optionProduct, setOptionProduct] = useState<Product | null>(null);
  const [optionChoice, setOptionChoice] = useState("");
  const [optionAction, setOptionAction] = useState<"cart" | "buy">("cart");
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE);

  useEffect(() => onSnapshot(doc(publicDb, "settings", "store"), (snapshot) => {
    const data = snapshot.data();
    if (data) setStoreSettings({ name: String(data.name || DEFAULT_STORE.name), color: String(data.color || DEFAULT_STORE.color) });
  }), []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(publicDb, "products"), (snapshot) => {
      const next = snapshot.docs
        .filter((item) => item.data().active !== false)
        .map((item) => {
          const data = item.data();
          const category = data.category as Category;
          return {
            id: item.id,
            name: String(data.name ?? ""),
            description: String(data.description ?? ""),
            price: Number(data.price ?? 0),
            category: categories.some((entry) => entry.value === category) ? category : "Combos",
            image: String(data.image ?? "") || productImages[item.id],
            options: Array.isArray(data.options) ? data.options.map(String) : String(data.options ?? "").split(",").map((value) => value.trim()).filter(Boolean),
            tag: data.tag ? String(data.tag) : undefined,
          } satisfies Product;
        })
        .filter((product) => product.name);
      setRemoteProducts(next);
    }, () => setRemoteProducts(null));
    return unsubscribe;
  }, []);

  const menuProducts = remoteProducts && remoteProducts.length ? remoteProducts : products;

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return menuProducts.filter((product) => {
      const inCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const inSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      return inCategory && inSearch;
    });
  }, [menuProducts, search, selectedCategory]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: Product, option?: string) => {
    const itemId = `${product.id}:${option ?? "default"}`;
    const selectedPrice = option ? product.optionPrices?.[option] ?? product.price : product.price;
    setCart((current) => {
      const existing = current.find((item) => item.id === itemId);
      if (existing) {
        return current.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, id: itemId, price: selectedPrice, quantity: 1, option }];
    });
  };

  const chooseProduct = (product: Product, action: "cart" | "buy") => {
    if (!product.options?.length) {
      if (action === "cart") addToCart(product);
      else startCheckout([{ ...product, quantity: 1 }]);
      return;
    }
    setOptionProduct(product);
    setOptionChoice(product.options[0]);
    setOptionAction(action);
  };

  const confirmOption = () => {
    if (!optionProduct || !optionChoice) return;
    if (optionAction === "cart") {
      addToCart(optionProduct, optionChoice);
      setOptionProduct(null);
    } else {
      setOptionProduct(null);
      const selectedPrice = optionProduct.optionPrices?.[optionChoice] ?? optionProduct.price;
      startCheckout([{ ...optionProduct, id: `${optionProduct.id}:${optionChoice}`, price: selectedPrice, option: optionChoice, quantity: 1 }]);
    }
  };

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const startCheckout = (items: CartItem[]) => {
    if (!items.length) return;
    setCheckoutItems(items);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const buyNow = (product: Product) => {
    startCheckout([{ ...product, quantity: 1 }]);
  };

  const sendOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orderLines = checkoutItems
      .map((item) => `• ${item.quantity}x ${item.name}${item.option ? ` (${item.option})` : ""} — ${money(item.price * item.quantity)}`)
      .join("\n");
    const message = [
      `Olá, ${storeSettings.name}! Quero fazer um pedido:`,
      "",
      orderLines,
      "",
      `*Total dos produtos: ${money(checkoutTotal)}*`,
      "*Frete: a combinar*",
      "*Total com frete: a confirmar*",
      "",
      `Nome: ${customerName.trim()}`,
      `Endereço: ${customerAddress.trim()}`,
      `Forma de pagamento: ${paymentMethod === "pix" ? "PIX" : "Dinheiro"}`,
      ...(paymentMethod === "dinheiro"
        ? [`Troco: ${needsChange === "sim" ? `Sim, para ${changeFor.trim() || "valor a informar"}` : "Não precisa"}`]
        : []),
      "",
      "Pode me informar quanto fica o total com o frete?",
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    setCheckoutOpen(false);
    setCustomerName("");
    setCustomerAddress("");
    setPaymentMethod("");
    setNeedsChange("");
    setChangeFor("");
  };

  return (
    <div className="site-shell" style={{ "--orange": storeSettings.color } as CSSProperties}>
      {!isOpen && (
        <div className="closed-banner" role="status">
          <div className="closed-banner__inner">
            <div className="closed-icon"><Clock3 size={20} /></div>
            <div>
              <strong>Estamos fechados no momento</strong>
              <span>O {storeSettings.name} abre às <b>{OPENING_TIME}</b>. Faça seu pedido a partir desse horário!</span>
            </div>
          </div>
        </div>
      )}

      <header className="topbar">
        <a className="brand" href="#inicio" aria-label={`${storeSettings.name} início`}>
          <img className="brand-logo" src={LOGO_PATH} alt={`${storeSettings.name} Delivery`} />
        </a>
        <div className="topbar__right">
          <div className={`open-indicator ${isOpen ? "is-open" : "is-closed"}`}>
            <span className="status-dot" />
            {isOpen ? "Aberto agora" : `Abre às ${OPENING_TIME}`}
          </div>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho">
            <ShoppingBag size={19} />
            <span>Meu carrinho</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero__glow hero__glow--one" />
          <div className="hero__glow hero__glow--two" />
          <div className="hero__content">
            <p className="eyebrow"><span /> Delivery • Lanches feitos na hora</p>
            <h1>O sabor que<br /><strong>mata a fome.</strong></h1>
            <p className="hero__copy">Seu lanche favorito, caprichado do jeito que você gosta. Escolha, adicione ao carrinho e peça pelo WhatsApp.</p>
            <a className="primary-cta" href="#cardapio">Ver cardápio <ArrowRight size={18} /></a>
          </div>
          <div className="hero__plate" aria-hidden="true">
            <div className="hero-logo-wrap"><img src={LOGO_PATH} alt="" className="hero-logo" /></div>
          </div>
        </section>

        <section className="menu-section" id="cardapio">
          <div className="section-heading">
            <div>
              <p className="eyebrow eyebrow--dark"><span /> Escolha o seu</p>
              <h2>Cardápio completo</h2>
            </div>
            <div className="search-box">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no cardápio" aria-label="Buscar no cardápio" />
            </div>
          </div>

          <div className="category-nav" role="tablist" aria-label="Categorias do cardápio">
            {categories.map((category) => (
              <button
                key={category.value}
                className={selectedCategory === category.value ? "category-pill is-active" : "category-pill"}
                onClick={() => setSelectedCategory(category.value)}
                role="tab"
                aria-selected={selectedCategory === category.value}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image"><img src={product.image || productImages[product.id] || LOGO_PATH} alt={product.name} loading="lazy" /></div>
                <div className="product-card__top">
                  <div className="product-icon"><UtensilsCrossed size={18} /></div>
                  <div className="product-price">
                    {product.tag && <span>{product.tag}</span>}
                    <strong>{money(product.price)}</strong>
                  </div>
                </div>
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                {product.options && <div className="options-hint"><ChevronDown size={13} /> Escolha: {product.options.join(" · ")}</div>}
                <div className="product-actions">
                  <button className="add-button" onClick={() => chooseProduct(product, "cart")}><Plus size={16} /> Adicionar ao carrinho</button>
                  <button className="buy-button" onClick={() => chooseProduct(product, "buy")}>Comprar</button>
                </div>
              </article>
            ))}
          </div>
          {!filteredProducts.length && (
            <div className="empty-state"><Search size={24} /><h3>Nenhum item encontrado</h3><p>Tente buscar por outro nome ou escolha outra categoria.</p></div>
          )}
        </section>

        <section className="info-strip">
          <div><Clock3 size={20} /><span><b>Horário de atendimento</b><small>Todos os dias, das {OPENING_TIME} às {CLOSING_TIME}</small></span></div>
          <div><Phone size={20} /><span><b>Peça pelo WhatsApp</b><small>(83) 98105-3745</small></span></div>
          <div><MapPin size={20} /><span><b>Delivery</b><small>Informe seu endereço no pedido</small></span></div>
        </section>
      </main>

      <footer className="footer"><span>© {new Date().getFullYear()} {storeSettings.name}</span><span>Feito para matar a fome.</span></footer>

      <button className="floating-cart" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho com pedido">
          <span className="floating-cart__icon"><ShoppingBag size={21} /><b>{cartCount}</b></span>
          <span><strong>{cartCount > 0 ? "Seu pedido" : "Carrinho"}</strong><small>{cartCount > 0 ? `${money(cartTotal)} · Ver carrinho` : "Adicionar produtos"}</small></span>
          <ArrowRight size={18} />
      </button>

      {cartOpen && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}>
          <aside className="cart-panel" aria-label="Carrinho">
            <div className="panel-header"><div><p className="eyebrow eyebrow--dark"><span /> Seu pedido</p><h2>Meu carrinho</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho"><X size={20} /></button></div>
            {cart.length === 0 ? (
              <div className="cart-empty"><div className="cart-empty__icon"><ShoppingBag size={28} /></div><h3>Seu carrinho está vazio</h3><p>Adicione seus favoritos e monte seu pedido.</p><button className="primary-cta primary-cta--small" onClick={() => { setCartOpen(false); document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth" }); }}>Explorar cardápio <ArrowRight size={16} /></button></div>
            ) : (
              <>
                <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><div className="cart-item__info"><b>{item.name}</b><span>{money(item.price)} cada</span></div>{item.option && <small className="cart-item__option">Opção: {item.option}</small>}<div className="cart-item__bottom"><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Diminuir ${item.name}`}>{item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Aumentar ${item.name}`}><Plus size={14} /></button></div><strong>{money(item.price * item.quantity)}</strong></div></div>)}</div>
                <div className="cart-summary"><div><span>Subtotal</span><strong>{money(cartTotal)}</strong></div><small>Frete calculado e combinado pelo WhatsApp.</small><button className="checkout-button" onClick={() => startCheckout(cart)}>Continuar para finalizar <ArrowRight size={17} /></button></div>
              </>
            )}
          </aside>
        </div>
      )}

      {optionProduct && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setOptionProduct(null)}>
          <section className="option-modal" aria-label={`Escolher opção para ${optionProduct.name}`}>
            <div className="panel-header"><div><p className="eyebrow eyebrow--dark"><span /> Personalize seu pedido</p><h2>{optionProduct.name}</h2></div><button className="icon-button" onClick={() => setOptionProduct(null)} aria-label="Fechar opções"><X size={20} /></button></div>
            <p className="option-modal__copy">Escolha uma opção para continuar:</p>
            <div className="option-list">{optionProduct.options?.map((option) => <button className={optionChoice === option ? "option-choice is-selected" : "option-choice"} key={option} onClick={() => setOptionChoice(option)}><span className="option-radio">{optionChoice === option && <Check size={13} />}</span><b>{option}</b><ArrowRight size={16} /></button>)}</div>
            <button className="checkout-button" onClick={confirmOption}>{optionAction === "cart" ? "Adicionar ao carrinho" : "Comprar agora"} <ArrowRight size={17} /></button>
          </section>
        </div>
      )}

      {checkoutOpen && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setCheckoutOpen(false)}>
          <section className="checkout-modal" aria-label="Finalizar pedido">
            <div className="panel-header"><div><p className="eyebrow eyebrow--dark"><span /> Quase lá</p><h2>Finalizar pedido</h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Fechar checkout"><X size={20} /></button></div>
            <div className="checkout-total"><span>Total dos produtos</span><strong>{money(checkoutTotal)}</strong><small>O frete será combinado no WhatsApp.</small></div>
            <form onSubmit={sendOrder}>
              <label>Nome completo<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Como podemos te chamar?" /></label>
              <label>Endereço de entrega<textarea required value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Rua, número, bairro e ponto de referência" rows={3} /></label>
              <fieldset className="payment-options"><legend>Forma de pagamento</legend><label><input type="radio" name="payment" value="pix" required checked={paymentMethod === "pix"} onChange={() => { setPaymentMethod("pix"); setNeedsChange(""); }} /> PIX</label><label><input type="radio" name="payment" value="dinheiro" checked={paymentMethod === "dinheiro"} onChange={() => setPaymentMethod("dinheiro")} /> Dinheiro</label></fieldset>
              {paymentMethod === "dinheiro" && <fieldset className="payment-options"><legend>Vai precisar de troco?</legend><label><input type="radio" name="change" value="nao" required checked={needsChange === "nao"} onChange={() => { setNeedsChange("nao"); setChangeFor(""); }} /> Não</label><label><input type="radio" name="change" value="sim" checked={needsChange === "sim"} onChange={() => setNeedsChange("sim")} /> Sim</label>{needsChange === "sim" && <label>Troco para quanto?<input required value={changeFor} onChange={(event) => setChangeFor(event.target.value)} placeholder="Ex.: R$ 50,00" /></label>}</fieldset>}
              <div className="checkout-note"><Check size={16} /> Seu pedido será enviado pronto para o WhatsApp do {storeSettings.name}.</div>
              <button className="checkout-button" type="submit">Finalizar e abrir WhatsApp <ArrowRight size={17} /></button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
