document.addEventListener('DOMContentLoaded', () => {
    const tableSelect = document.getElementById('table-select');
    const bottleSelect = document.getElementById('bottle-select');
    const quantitySelect = document.getElementById('quantity-select'); 
    const addOrderButton = document.getElementById('add-order');
    const orderList = document.getElementById('order-list');
    const numberOfTables = 75;

    // Modifica dell'ordine nel LocalStorage
    const modifyOrder = (table, bottle, newQuantity) => {
        const orders = JSON.parse(localStorage.getItem('orders')) || {};
        if (orders[table]) {
            orders[table].forEach(item => {
                if (item.bottle === bottle) {
                    item.quantity = newQuantity;
                }
            });
            localStorage.setItem('orders', JSON.stringify(orders));
            loadOrders();
        }
    }

    // Aggiungi input per la modifica della quantità con controlli di aumento e diminuzione
    const addQuantityInput = (li, table, bottle, quantity) => {
        const quantityContainer = document.createElement('div');
        quantityContainer.classList.add('quantity-container');

        const decreaseButton = document.createElement('button');
        decreaseButton.textContent = '-';
        decreaseButton.className = 'quantity-button decrease';
        decreaseButton.addEventListener('click', () => {
            if (quantity > 1) {
                modifyOrder(table, bottle, quantity - 1);
            }
        });
        quantityContainer.appendChild(decreaseButton);

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = quantity;
        quantityInput.min = 1;
        quantityInput.addEventListener('change', (event) => {
            modifyOrder(table, bottle, event.target.value);
        });
        quantityContainer.appendChild(quantityInput);

        const increaseButton = document.createElement('button');
        increaseButton.textContent = '+';
        increaseButton.className = 'quantity-button increase';
        increaseButton.addEventListener('click', () => {
            modifyOrder(table, bottle, parseInt(quantity) + 1);
        });
        quantityContainer.appendChild(increaseButton);

        li.appendChild(quantityContainer);
    }

    // CSS per stilizzare i controlli di aumento e diminuzione della quantità
    const styleQuantityControls = () => {
        const style = document.createElement('style');
        style.textContent = `
            .quantity-container {
                display: flex;
                align-items: center;
            }

            .quantity-button {
                width: 30px;
                height: 30px;
                font-size: 20px;
                border: none;
                cursor: pointer;
                transition: background-color 0.3s ease;
                margin: 0 5px;
            }

            .quantity-button:hover {
                background-color: #e0e0e0;
            }

            .decrease {
                background-color: #e74c3c; /* Rosso */
                color: white;
            }

            .increase {
                background-color: #2ecc71; /* Verde */
                color: white;
            }

            .order-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                border: 1px solid #ddd;
                margin-bottom: 5px;
            }

            .delete-button {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                margin-left: 10px;
            }

            .delete-button:hover {
                background-color: #c0392b;
            }

            .order-text {
                flex-grow: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // Chiamata per applicare lo stile ai controlli di aumento e diminuzione della quantità
    styleQuantityControls();

    // Inizializza tavoli
    for (let i = 1; i <= numberOfTables; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Tavolo ${i}`;
        tableSelect.appendChild(option);
    }

    // Carica ordini dal LocalStorage
    const loadOrders = () => {
        orderList.innerHTML = '';
        const orders = JSON.parse(localStorage.getItem('orders')) || {};
        for (const [table, items] of Object.entries(orders)) {
            items.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'order-item';
                
                const orderText = document.createElement('span');
                orderText.className = 'order-text';
                orderText.textContent = `Tavolo ${table}: ${item.quantity}x ${item.bottle}`;
                li.appendChild(orderText);

                li.dataset.table = table;
                li.dataset.bottle = item.bottle;
                li.dataset.quantity = item.quantity; // Aggiunto il dataset per la quantità

                addQuantityInput(li, table, item.bottle, item.quantity);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Elimina';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => removeOrder(table, item.bottle, item.quantity); // Passaggio di bottiglia e quantità

                li.appendChild(deleteButton);
                orderList.appendChild(li);

                // Aggiungi un separatore tra gli ordini dello stesso tavolo, tranne per l'ultimo elemento
                if (index !== items.length - 1) {
                    const separator = document.createElement('hr');
                    orderList.appendChild(separator);
                }
            });

            // Aggiungi un separatore tra gli ordini di diversi tavoli, tranne per l'ultimo tavolo
            if (table !== Object.keys(orders)[Object.keys(orders).length - 1]) {
                const separator = document.createElement('hr');
                orderList.appendChild(separator);
            }
        }
    }

    // Salva ordini nel LocalStorage
    const saveOrder = (table, bottle, quantity) => {
        const orders = JSON.parse(localStorage.getItem('orders')) || {};
        if (!orders[table]) {
            orders[table] = [];
        }

        let orderExists = false;
        orders[table].forEach(item => {
            if (item.bottle === bottle) {
                item.quantity = parseInt(item.quantity) + parseInt(quantity); // Aggiungi la nuova quantità alla quantità esistente
                orderExists = true;
            }
        });

        if (!orderExists) {
            orders[table].push({ bottle, quantity });
        }

        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }

    // Rimuovi ordini dal LocalStorage
    const removeOrder = (table, bottle, quantity) => { // Aggiunto il parametro quantity
        const orders = JSON.parse(localStorage.getItem('orders')) || {};
        if (orders[table]) {
            orders[table] = orders[table].filter(item => item.bottle !== bottle || item.quantity !== quantity); // Rimuovi solo se corrisponde alla bottiglia e quantità
            if (orders[table].length === 0) {
                delete orders[table];
            }
        }
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }

    // Gestore del click per aggiungere un ordine
    addOrderButton.addEventListener('click', () => {
        const table = tableSelect.value;
        const bottle = bottleSelect.value;
        const quantity = quantitySelect.value; // Ottenere la quantità selezionata
        if (table && bottle && quantity) { // Controllare se sono stati selezionati tavolo, bottiglia e quantità
            saveOrder(table, bottle, quantity); // Passare anche la quantità
        }
    });

    // Carica ordini all'avvio
    loadOrders();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
        .then(() => {
            console.log('Service Worker Registered');
        });
    }
});
