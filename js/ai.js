// ai.js - AI assistant with comprehensive local product knowledge

export class AIService {
  constructor(productService) {
    this.productService = productService;
  }

  buildProductContext() {
    const products = this.productService.getProducts();
    return products.map(p => `${p.name} | ${p.category} | ${p.active_ingredient} | ₽${p.price} | Stock: ${p.stock}`).join('\n');
  }

  // Detect if query is in Russian
  isRussianQuery(query) {
    const russianPattern = /[а-яё]/i;
    return russianPattern.test(query);
  }

  // Get current language setting
  getCurrentLanguage() {
    // Try multiple ways to get the current language
    if (typeof window !== 'undefined' && window.CURRENT_LANG) {
      return window.CURRENT_LANG;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('medicineSeller-lang') || 'ru';
    }
    return 'ru'; // Default to Russian
  }

  // Get appropriate response based on language
  getLocalizedResponse(key, params = {}) {
    const currentLang = this.getCurrentLanguage();
    console.log('AI Language Detection:', { key, currentLang, params }); // Debug log
    
    const responses = {
      en: {
        yesInStock: (name, stock, price, description) => `Yes! ${name} is in stock. We have ${stock} units available.\n\nPrice: ${price}\n${description}`,
        outOfStock: (name, price, description) => `Sorry, ${name} is currently out of stock.\n\nPrice: ${price}\n${description}\n\nWould you like me to show you similar products?`,
        productsContaining: (ingredient) => `Products containing ${ingredient}:\n\n`,
        productsWithIngredients: `Products with those ingredients:\n\n`,
        hereAreProducts: (category) => `Here are our ${category} products:\n\n`,
        availableCategories: `Available categories:\n`,
        mostAffordable: `Here are our most affordable products:\n\n`,
        premiumProducts: `Here are our premium products:\n\n`,
        stockStatus: (inStock, outOfStock) => `Stock status:\n• ${inStock} products in stock\n• ${outOfStock} products out of stock\n\nAvailable products:\n\n`,
        forCondition: (condition) => `For ${condition}, I recommend:\n\n`,
        foundProducts: (count) => `I found ${count} product(s) matching your search:\n\n`,
        topRecommendations: `Here are our top recommendations:\n\n`,
        helpText: `I can help you with:\n• Finding products by name or condition\n• Checking stock availability\n• Showing products by category\n• Getting prices and product information\n• Information about ingredients\n• Product recommendations\n\nJust ask me about any health condition or product you're looking for!`,
        heresWhatFound: `Here's what I found:\n\n`,
        stockInfo: (stock) => stock > 0 ? `In stock (${stock})` : 'Out of stock',
        // Purchase guidance responses
        howToBuy: `To purchase products from our pharmacy:\n\n1. **Browse Products**: Look through our catalog or use the search function\n2. **Add to Cart**: Click the "Add to Cart" button on any product\n3. **View Cart**: Click the cart icon in the top right to review your items\n4. **Checkout**: Use the WhatsApp button to complete your order\n5. **Payment**: We'll arrange payment and delivery through WhatsApp\n\nNeed help finding a specific product? Just ask me!`,
        purchaseSteps: `Here's how to buy from our pharmacy:\n\n🛒 **Step 1**: Browse our products or search for what you need\n🛒 **Step 2**: Click "Add to Cart" on desired items\n🛒 **Step 3**: Review your cart (cart icon in top right)\n🛒 **Step 4**: Click "Order via WhatsApp" to complete purchase\n🛒 **Step 5**: We'll handle payment and delivery details\n\nI can help you find specific products or answer questions about any item!`,
        cartHelp: `Shopping cart help:\n\n• **Add items**: Click "Add to Cart" on any product\n• **View cart**: Click the cart icon (🛒) in the top right\n• **Remove items**: Use the trash icon in the cart\n• **Checkout**: Click "Order via WhatsApp" when ready\n• **Empty cart**: Use "Clear Cart" if you want to start over\n\nNeed product recommendations? Just ask!`,
        paymentInfo: `Payment and delivery information:\n\n💰 **Payment Methods**: We accept various payment methods (discuss via WhatsApp)\n🚚 **Delivery**: We arrange delivery details through WhatsApp\n📞 **Contact**: Use the WhatsApp button for immediate assistance\n⏰ **Processing**: Orders are typically processed within 24 hours\n\nReady to order? Add items to your cart and click "Order via WhatsApp"!`,
        orderHelp: `Order assistance:\n\n1. **Find Products**: Browse categories or search by name/condition\n2. **Add to Cart**: Click the cart button on any product\n3. **Review Order**: Check your cart before ordering\n4. **WhatsApp Order**: Click "Order via WhatsApp" to finalize\n5. **Follow Up**: We'll contact you for payment and delivery\n\nNeed product recommendations? Tell me what condition you're treating!`,
        fallback: 'I recommend consulting a healthcare professional for medical advice.'
      },
      ru: {
        yesInStock: (name, stock, price, description) => `Да! ${name} есть в наличии. У нас есть ${stock} единиц.\n\nЦена: ${price}\n${description}`,
        outOfStock: (name, price, description) => `Извините, ${name} сейчас нет в наличии.\n\nЦена: ${price}\n${description}\n\nХотите, чтобы я показал похожие товары?`,
        productsContaining: (ingredient) => `Продукты, содержащие ${ingredient}:\n\n`,
        productsWithIngredients: `Продукты с этими ингредиентами:\n\n`,
        hereAreProducts: (category) => `Вот наши продукты категории ${category}:\n\n`,
        availableCategories: `Доступные категории:\n`,
        mostAffordable: `Вот наши самые доступные продукты:\n\n`,
        premiumProducts: `Вот наши премиум продукты:\n\n`,
        stockStatus: (inStock, outOfStock) => `Статус склада:\n• ${inStock} продуктов в наличии\n• ${outOfStock} продуктов нет в наличии\n\nДоступные продукты:\n\n`,
        forCondition: (condition) => `Для ${condition} я рекомендую:\n\n`,
        foundProducts: (count) => `Я нашел ${count} продукт(ов), соответствующих вашему поиску:\n\n`,
        topRecommendations: `Вот наши топ рекомендации:\n\n`,
        helpText: `Я могу помочь вам с:\n• Поиском продуктов по названию или состоянию\n• Проверкой наличия на складе\n• Показом продуктов по категориям\n• Получением цен и информации о продуктах\n• Информацией об ингредиентах\n• Рекомендациями продуктов\n\nПросто спросите меня о любом состоянии здоровья или продукте, который вы ищете!`,
        heresWhatFound: `Вот что я нашел:\n\n`,
        stockInfo: (stock) => stock > 0 ? `В наличии (${stock})` : 'Нет в наличии',
        // Purchase guidance responses in Russian
        howToBuy: `Чтобы купить товары в нашей аптеке:\n\n1. **Просмотр товаров**: Изучите наш каталог или используйте поиск\n2. **Добавить в корзину**: Нажмите кнопку "Добавить в корзину" на любом товаре\n3. **Просмотр корзины**: Нажмите на иконку корзины в правом верхнем углу\n4. **Оформление заказа**: Используйте кнопку WhatsApp для завершения заказа\n5. **Оплата**: Мы организуем оплату и доставку через WhatsApp\n\nНужна помощь в поиске конкретного товара? Просто спросите меня!`,
        purchaseSteps: `Вот как купить в нашей аптеке:\n\n🛒 **Шаг 1**: Просмотрите наши товары или найдите то, что вам нужно\n🛒 **Шаг 2**: Нажмите "Добавить в корзину" на нужных товарах\n🛒 **Шаг 3**: Просмотрите корзину (иконка корзины в правом верхнем углу)\n🛒 **Шаг 4**: Нажмите "Заказать через WhatsApp" для завершения покупки\n🛒 **Шаг 5**: Мы организуем оплату и доставку\n\nЯ могу помочь вам найти конкретные товары или ответить на вопросы о любом товаре!`,
        cartHelp: `Помощь с корзиной покупок:\n\n• **Добавить товары**: Нажмите "Добавить в корзину" на любом товаре\n• **Просмотр корзины**: Нажмите на иконку корзины (🛒) в правом верхнем углу\n• **Удалить товары**: Используйте иконку корзины в корзине\n• **Оформить заказ**: Нажмите "Заказать через WhatsApp" когда будете готовы\n• **Очистить корзину**: Используйте "Очистить корзину" если хотите начать заново\n\nНужны рекомендации по товарам? Просто спросите!`,
        paymentInfo: `Информация об оплате и доставке:\n\n💰 **Способы оплаты**: Мы принимаем различные способы оплаты (обсуждается через WhatsApp)\n🚚 **Доставка**: Мы организуем доставку через WhatsApp\n📞 **Контакты**: Используйте кнопку WhatsApp для немедленной помощи\n⏰ **Обработка**: Заказы обычно обрабатываются в течение 24 часов\n\nГотовы заказать? Добавьте товары в корзину и нажмите "Заказать через WhatsApp"!`,
        orderHelp: `Помощь с заказом:\n\n1. **Найти товары**: Просмотрите категории или найдите по названию/состоянию\n2. **Добавить в корзину**: Нажмите кнопку корзины на любом товаре\n3. **Проверить заказ**: Проверьте корзину перед заказом\n4. **Заказ через WhatsApp**: Нажмите "Заказать через WhatsApp" для завершения\n5. **Отслеживание**: Мы свяжемся с вами для оплаты и доставки\n\nНужны рекомендации по товарам? Скажите, какое состояние вы лечите!`,
        fallback: 'Я рекомендую проконсультироваться с медицинским работником для получения медицинских советов.'
      }
    };
    
    const response = responses[currentLang]?.[key] || responses.en[key];
    return typeof response === 'function' ? response(...Object.values(params)) : response;
  }

  async ask(prompt) {
    // First try to answer from local product data
    const local = this.answerFromLocal(prompt);
    if (local) return local;

    // Fallback to OpenAI via server-side proxy
    try {
      // TODO: This endpoint must be a server-side proxy that securely attaches the OPENAI_API_KEY.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          context: this.buildProductContext()
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data?.response?.trim() || this.getLocalizedResponse('fallback');
    } catch (error) {
      console.error('AI service error:', error);
      return this.getLocalizedResponse('fallback');
    }
  }

  answerFromLocal(query) {
    const q = query.toLowerCase();
    const products = this.productService.getProducts();
    const isRussian = this.isRussianQuery(query);
    
    // Helper function to get translated product info
    const getProductInfo = (product) => {
      const name = window.getTranslatedProductName ? window.getTranslatedProductName(product.id) : product.name;
      const description = window.getTranslatedProductDescription ? window.getTranslatedProductDescription(product.id) : product.description;
      const price = window.buildCurrency ? window.buildCurrency(product.price) : `₽${product.price}`;
      const stock = this.getLocalizedResponse('stockInfo', { stock: product.stock });
      return { name, description, price, stock, original: product };
    };

    // Helper function to format product response
    const formatProducts = (products, maxCount = 5) => {
      return products.slice(0, maxCount).map(p => {
        const info = getProductInfo(p);
        return `${info.name} - ${info.price}\n${info.description}\nНаличие: ${info.stock}`;
      }).join('\n\n');
    };

    // Product search by name (handles "Do you have X in stock?" queries)
    if (q.includes('do you have') || q.includes('есть ли') || q.includes('have') || q.includes('stock') || q.includes('наличи')) {
      // Extract product name from query - improved logic
      const searchTerms = q
        .replace(/do you have|есть ли|in stock|в наличии|available|доступн|\?/g, '')
        .trim()
        .split(' ')
        .filter(word => word.length >= 3 && !['the', 'a', 'an', 'any', 'you', 'and', 'у', 'нас', 'есть'].includes(word.toLowerCase()));
      
      console.log('Search terms extracted:', searchTerms); // Debug log
      
      const matches = products.filter(p => 
        searchTerms.some(term => 
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.description.toLowerCase().includes(term.toLowerCase()) ||
          p.active_ingredient.toLowerCase().includes(term.toLowerCase()) ||
          (p.name_ru && p.name_ru.toLowerCase().includes(term.toLowerCase())) ||
          (p.description_ru && p.description_ru.toLowerCase().includes(term.toLowerCase()))
        )
      );
      
      console.log('Matches found:', matches.map(p => p.name)); // Debug log
      
      if (matches.length > 0) {
        const product = matches[0];
        const info = getProductInfo(product);
        if (product.stock > 0) {
          return this.getLocalizedResponse('yesInStock', {
            name: info.name,
            stock: product.stock,
            price: info.price,
            description: info.description
          });
        } else {
          return this.getLocalizedResponse('outOfStock', {
            name: info.name,
            price: info.price,
            description: info.description
          });
        }
      }
    }

    // Ingredient queries (handles "What contains magnesium?" type queries)
    if (q.includes('contains') || q.includes('содержит') || q.includes('with') || q.includes('ingredient')) {
      const ingredients = {
        'magnesium': ['Magnesium Glycinate'],
        'магний': ['Magnesium Glycinate'],
        'melatonin': ['Melatonin Sleep Aid'],
        'мелатонин': ['Melatonin Sleep Aid'],
        'vitamin d': ['Vitamin D3 Supreme'],
        'витамин д': ['Vitamin D3 Supreme'],
        'omega': ['Omega-3 Complete'],
        'омега': ['Omega-3 Complete'],
        'aspirin': ['Aspirin Plus'],
        'аспирин': ['Aspirin Plus'],
        'probiotic': ['Probiotic Balance'],
        'пробиотик': ['Probiotic Balance'],
        'collagen': ['Collagen Beauty'],
        'коллаген': ['Collagen Beauty'],
        'zinc': ['Zinc Immune Support'],
        'цинк': ['Zinc Immune Support'],
        'turmeric': ['Turmeric Curcumin'],
        'куркума': ['Turmeric Curcumin'],
        'glucosamine': ['Glucosamine Joint Care'],
        'глюкозамин': ['Glucosamine Joint Care'],
        'coq10': ['CoQ10 Heart Health'],
        'коэнзим': ['CoQ10 Heart Health'],
        'vitamin b': ['B-Complex Energy'],
        'витамин б': ['B-Complex Energy']
      };

      for (const [ingredient, productNames] of Object.entries(ingredients)) {
        if (q.includes(ingredient)) {
          const matchedProducts = products.filter(p => 
            productNames.some(name => p.name.includes(name)) ||
            p.active_ingredient.toLowerCase().includes(ingredient) ||
            (p.active_ingredient_ru && p.active_ingredient_ru.toLowerCase().includes(ingredient))
          );
          
          if (matchedProducts.length > 0) {
            return this.getLocalizedResponse('productsContaining', { ingredient }) + formatProducts(matchedProducts);
          }
        }
      }

      // General ingredient search
      const ingredientTerms = q.split(' ').filter(word => 
        !['what', 'contains', 'with', 'ingredient', 'products', 'medicine', 'что', 'содержит', 'с', 'ингредиент', 'продукты', 'лекарства'].includes(word)
      );
      
      const ingredientMatches = products.filter(p => 
        ingredientTerms.some(term => 
          p.active_ingredient.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          (p.active_ingredient_ru && p.active_ingredient_ru.toLowerCase().includes(term)) ||
          (p.name_ru && p.name_ru.toLowerCase().includes(term))
        )
      );
      
      if (ingredientMatches.length > 0) {
        return this.getLocalizedResponse('productsWithIngredients') + formatProducts(ingredientMatches);
      }
    }

    // Category queries
    if (q.includes('category') || q.includes('категория') || q.includes('show') || q.includes('покажи')) {
      const categoryMap = {
        'pain': 'Pain Relief',
        'боль': 'Pain Relief',
        'витамин': 'Vitamins & Supplements',
        'vitamin': 'Vitamins & Supplements',
        'сон': 'Sleep & Relaxation',
        'sleep': 'Sleep & Relaxation',
        'красота': 'Beauty & Wellness',
        'beauty': 'Beauty & Wellness',
        'пищеварение': 'Digestive Health',
        'digestive': 'Digestive Health',
        'сердце': 'Heart Health',
        'heart': 'Heart Health',
        'суставы': 'Joint Health',
        'joint': 'Joint Health'
      };

      for (const [key, category] of Object.entries(categoryMap)) {
        if (q.includes(key)) {
          const categoryProducts = products.filter(p => p.category === category);
          if (categoryProducts.length > 0) {
            return this.getLocalizedResponse('hereAreProducts', { category }) + formatProducts(categoryProducts);
          }
        }
      }

      // Show all categories
      if (q.includes('все категории') || q.includes('all categories')) {
        const categories = this.productService.getCategories();
        return this.getLocalizedResponse('availableCategories') + categories.map(cat => `• ${cat}`).join('\n');
      }
    }

    // Price queries
    if (q.includes('цена') || q.includes('price') || q.includes('стоимость') || q.includes('cost')) {
      if (q.includes('дешев') || q.includes('cheap') || q.includes('недорог')) {
        const cheapProducts = products.filter(p => p.price < 200).sort((a, b) => a.price - b.price);
        if (cheapProducts.length > 0) {
          return this.getLocalizedResponse('mostAffordable') + formatProducts(cheapProducts);
        }
      }
      
      if (q.includes('дорог') || q.includes('expensive') || q.includes('премиум')) {
        const expensiveProducts = products.filter(p => p.price > 500).sort((a, b) => b.price - a.price);
        if (expensiveProducts.length > 0) {
          return this.getLocalizedResponse('premiumProducts') + formatProducts(expensiveProducts);
        }
      }
    }

    // Stock queries
    if (q.includes('наличие') || q.includes('stock') || q.includes('в наличии') || q.includes('available')) {
      const inStock = products.filter(p => p.stock > 0);
      const outOfStock = products.filter(p => p.stock === 0);
      
      return this.getLocalizedResponse('stockStatus', { inStock: inStock.length, outOfStock: outOfStock.length }) + formatProducts(inStock);
    }

    // Health condition mapping
    const healthConditions = {
      'головная боль': ['Aspirin Plus'],
      'headache': ['Aspirin Plus'],
      'боль': ['Aspirin Plus'],
      'pain': ['Aspirin Plus'],
      'витамин': ['Vitamin D3 Supreme', 'Omega-3 Complete', 'B-Complex Energy'],
      'vitamin': ['Vitamin D3 Supreme', 'Omega-3 Complete', 'B-Complex Energy'],
      'сон': ['Melatonin Sleep Aid'],
      'sleep': ['Melatonin Sleep Aid'],
      'бессонница': ['Melatonin Sleep Aid'],
      'insomnia': ['Melatonin Sleep Aid'],
      'кожа': ['Collagen Beauty'],
      'skin': ['Collagen Beauty'],
      'волосы': ['Collagen Beauty'],
      'hair': ['Collagen Beauty'],
      'пищеварение': ['Probiotic Balance'],
      'digestion': ['Probiotic Balance'],
      'иммунитет': ['Zinc Immune Support', 'Vitamin D3 Supreme'],
      'immune': ['Zinc Immune Support', 'Vitamin D3 Supreme'],
      'энергия': ['B-Complex Energy'],
      'energy': ['B-Complex Energy'],
      'суставы': ['Glucosamine Joint Care', 'Turmeric Curcumin'],
      'joints': ['Glucosamine Joint Care', 'Turmeric Curcumin'],
      'сердце': ['CoQ10 Heart Health', 'Omega-3 Complete'],
      'heart': ['CoQ10 Heart Health', 'Omega-3 Complete']
    };

    for (const [condition, productNames] of Object.entries(healthConditions)) {
      if (q.includes(condition)) {
        const matchedProducts = products.filter(p => 
          productNames.some(name => p.name.includes(name))
        );
        
        if (matchedProducts.length > 0) {
          return this.getLocalizedResponse('forCondition', { condition }) + formatProducts(matchedProducts);
        }
      }
    }

    // General product search
    if (q.includes('найти') || q.includes('find') || q.includes('search') || q.includes('ищу') || q.includes('looking for')) {
      const searchTerms = q
        .replace(/найти|find|search|ищу|looking for|для|for|мне|me/g, '')
        .split(' ')
        .filter(word => word.length > 2);
      
      const matches = products.filter(p => 
        searchTerms.some(term => 
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.active_ingredient.toLowerCase().includes(term) ||
          (p.name_ru && p.name_ru.toLowerCase().includes(term)) ||
          (p.description_ru && p.description_ru.toLowerCase().includes(term)) ||
          (p.active_ingredient_ru && p.active_ingredient_ru.toLowerCase().includes(term))
        )
      );
      
      if (matches.length > 0) {
        return this.getLocalizedResponse('foundProducts', { count: matches.length }) + formatProducts(matches);
      }
    }

    // General recommendations
    if (q.includes('рекоменд') || q.includes('recommend') || q.includes('посовет') || q.includes('suggest')) {
      const featured = products.filter(p => p.id <= 3); // Featured products
      return this.getLocalizedResponse('topRecommendations') + formatProducts(featured);
    }

    // Purchase guidance queries
    if (q.includes('как купить') || q.includes('how to buy') || q.includes('как заказать') || q.includes('how to order') || 
        q.includes('как приобрести') || q.includes('how to purchase') || q.includes('покупка') || q.includes('purchase')) {
      return this.getLocalizedResponse('howToBuy');
    }
    
    if (q.includes('корзина') || q.includes('cart') || q.includes('shopping cart') || q.includes('покупки')) {
      return this.getLocalizedResponse('cartHelp');
    }
    
    if (q.includes('оплата') || q.includes('payment') || q.includes('доставка') || q.includes('delivery') || 
        q.includes('способы оплаты') || q.includes('payment methods')) {
      return this.getLocalizedResponse('paymentInfo');
    }
    
    if (q.includes('заказ') || q.includes('order') || q.includes('оформить') || q.includes('checkout') || 
        q.includes('шаги') || q.includes('steps') || q.includes('процесс') || q.includes('process')) {
      return this.getLocalizedResponse('orderHelp');
    }
    
    if (q.includes('купить') || q.includes('buy') || q.includes('приобрести') || q.includes('get') || 
        q.includes('получить') || q.includes('where to buy') || q.includes('где купить')) {
      return this.getLocalizedResponse('purchaseSteps');
    }

    // Help queries
    if (q.includes('помощь') || q.includes('help') || q.includes('что умеешь') || q.includes('what can you do')) {
      return this.getLocalizedResponse('helpText');
    }

    // Default category fallback - try to match any product names or ingredients
    const words = q.split(' ').filter(word => word.length > 2);
    const generalMatches = products.filter(p => 
      words.some(word => 
        p.name.toLowerCase().includes(word) ||
        p.description.toLowerCase().includes(word) ||
        p.active_ingredient.toLowerCase().includes(word) ||
        p.category.toLowerCase().includes(word) ||
        (p.name_ru && p.name_ru.toLowerCase().includes(word)) ||
        (p.description_ru && p.description_ru.toLowerCase().includes(word)) ||
        (p.active_ingredient_ru && p.active_ingredient_ru.toLowerCase().includes(word)) ||
        (p.category_ru && p.category_ru.toLowerCase().includes(word))
      )
    );
    
    if (generalMatches.length > 0) {
      return this.getLocalizedResponse('heresWhatFound') + formatProducts(generalMatches, 3);
    }

    return null; // No local match found, will fallback to API
  }
}