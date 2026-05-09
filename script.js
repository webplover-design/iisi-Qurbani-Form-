const qurbaniPackages = [
    { id: "cow-share", name: "Cow Per Share", pkr: 30000, usd: 108, gbp: 85 },
    { id: "full-cow", name: "Full Cow (7 Shares)", pkr: 210000, usd: 753, gbp: 590 },
    { id: "goat", name: "Goat", pkr: 50000, usd: 179, gbp: 140 }
];

const bankDetails = {
    accounts: [
        { bankName: "Meezan Bank", accountTitle: "M.Abdul Basit", accountNumber: "03810101515055" },
        { bankName: "Meezan Bank", accountTitle: "Touseef Altaf", accountNumber: "03810101224063", iban: "PK85MEZN0003810101224063" }
    ]
};

function generateTrackingId() {
    return "QUR" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function calculateTotal(packageData, quantity) {
    return {
        pkr: packageData.pkr * quantity,
        usd: packageData.usd * quantity,
        gbp: packageData.gbp * quantity
    };
}

function formatAmount(currency, value) {
    return `${currency} ${Number(value || 0).toLocaleString("en-US")}`;
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
    }[character]));
}

function isValidContactNumber(value) {
    return /^\d{9,14}$/.test(String(value || "").trim());
}

function submitSkinCollection() {
    const skinType = document.getElementById('skin-type')?.value;
    const quantity = document.getElementById('skin-quantity')?.value;
    const collectionDay = document.getElementById('collection-day')?.value;
    const suitableTime = document.getElementById('suitable-time')?.value;
    const donorName = document.getElementById('donor-name')?.value;
    const donorContact = document.getElementById('donor-contact')?.value;
    const donorAddress = document.getElementById('donor-address')?.value;

    if (!skinType || !quantity || !collectionDay || !suitableTime || !donorName || !donorContact || !donorAddress) {
        alert('Please fill in all required fields.');
        return;
    }

    if (!isValidContactNumber(donorContact)) {
        alert('Please enter a valid contact number with 9 to 14 digits.');
        return;
    }

    alert('Skin collection appeal submitted successfully!');
}

function loadTokenPage() {
    const orderData = JSON.parse(localStorage.getItem('orderData'));
    if (!orderData) {
        alert('No order data found.');
        return;
    }

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText('tracking-id', orderData.trackingId);
    setText('order-by', orderData.fullName);
    const bankAccounts = document.getElementById('bank-accounts');
    if (bankAccounts) {
        bankAccounts.innerHTML = bankDetails.accounts.map(account => '<div class="bank-account-card"><p><strong>Account Title:</strong> ' + escapeHtml(account.accountTitle) + '</p><p><strong>Bank Name:</strong> ' + escapeHtml(account.bankName) + '</p><p><strong>Account Number:</strong> ' + escapeHtml(account.accountNumber) + '</p>' + (account.iban ? '<p><strong>IBAN:</strong> ' + escapeHtml(account.iban) + '</p>' : '') + '</div>').join('');
    }

    const orderSummary = document.getElementById('token-order-summary');
    if (orderSummary) {
        let html = '<table><thead><tr><th>Package</th><th>Type</th><th>Waqf For / Collection</th><th>Qurbani By</th><th>Quantity</th><th>Total PKR</th><th>Total USD</th><th>Total GBP</th></tr></thead><tbody>';
        orderData.items.forEach(item => {
            html += '<tr>' +
                '<td>' + escapeHtml(item.package) + '</td>' +
                '<td>' + escapeHtml(item.type) + '</td>' +
                '<td>' + escapeHtml(item.waqfFor) + '</td>' +
                '<td>' + escapeHtml(item.qurbaniBy) + '</td>' +
                '<td>' + escapeHtml(item.quantity) + '</td>' +
                '<td>' + escapeHtml(item.totalPkr) + '</td>' +
                '<td>' + escapeHtml(item.totalUsd) + '</td>' +
                '<td>' + escapeHtml(item.totalGbp) + '</td>' +
                '</tr>';
        });
        html += '</tbody></table>';
        orderSummary.innerHTML = html;
    }

    const whatsappLink = document.getElementById('whatsapp-link');
    const receiptWhatsappButton = document.getElementById('receipt-whatsapp-btn');
    const orderLines = orderData.items.map(item => item.package + ' - ' + item.type + ' - ' + item.waqfFor + ' - Qty: ' + item.quantity + ' - Total PKR: ' + item.totalPkr).join('\n');
    const whatsappMessage = 'Tracking ID: ' + orderData.trackingId + '\nCustomer Name: ' + orderData.fullName + '\nContact: ' + orderData.contactNumber + '\nAddress: ' + orderData.address + ', ' + orderData.city + ', ' + orderData.country + '\n\nOrder Details:\n' + orderLines + '\n\nI want to send my payment receipt for confirmation.';
    const whatsappHref = 'https://wa.me/923365363550?text=' + encodeURIComponent(whatsappMessage);
    if (whatsappLink) whatsappLink.href = whatsappHref;
    if (receiptWhatsappButton) receiptWhatsappButton.href = whatsappHref;
}
async function downloadToken() {
    const orderData = JSON.parse(localStorage.getItem('orderData'));
    const tokenCard = document.querySelector('.token-section');
    if (!orderData || !tokenCard) return;

    const actions = tokenCard.querySelector('.cta-buttons');
    if (actions) actions.style.display = 'none';

    try {
        const canvas = await html2canvas(tokenCard, {
            backgroundColor: '#fffbf2',
            scale: 2,
            useCORS: true
        });
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'qurbani-token-' + orderData.trackingId + '.png';
        a.click();
    } finally {
        if (actions) actions.style.display = '';
    }
}
function printToken() {
    window.print();
}

function initQurbaniWizard() {
    const wizard = document.getElementById('qurbani-wizard');
    if (!wizard) return;

    let currentStep = 0;
    let highestStep = 0;
    let orderItems = [];
    let pendingItemKey = '';

    const steps = Array.from(document.querySelectorAll('.qurbani-wizard-step'));
    const navButtons = Array.from(document.querySelectorAll('.qurbani-step-nav'));
    const alertBox = document.getElementById('qurbani-alert');
    const previousButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    const collectionPanel = document.getElementById('collection-options-panel');
    const waqfPanel = document.getElementById('waqf-options-panel');
    const quantityInput = document.getElementById('quantity');
    const foreignTotals = document.getElementById('foreign-totals');
    const currencyToggle = document.getElementById('currency-toggle');
    const currencySelect = document.getElementById('currency-select');
    const chooseAnotherButton = document.getElementById('choose-another-item');
    const addedItemsPanel = document.getElementById('added-items-panel');
    const addedItemsList = document.getElementById('added-items-list');

    const getSelectedPackage = () => {
        const selected = document.querySelector('input[name="qurbaniPackage"]:checked');
        return selected ? qurbaniPackages.find(packageData => packageData.id === selected.value) : null;
    };

    const getQurbaniType = () => document.querySelector('input[name="qurbaniType"]:checked')?.value || 'waqf';

    const getQuantity = () => {
        const parsedQuantity = parseInt(quantityInput.value, 10);
        return Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
    };

    const getTotals = () => {
        const packageData = getSelectedPackage();
        return packageData ? calculateTotal(packageData, getQuantity()) : { pkr: 0, usd: 0, gbp: 0 };
    };

    const getSelectedCurrency = () => currencySelect?.value || 'pkr';

    const formatSelectedAmount = totals => {
        const selectedCurrency = getSelectedCurrency();
        return formatAmount(selectedCurrency.toUpperCase(), totals[selectedCurrency]);
    };

    const getItemSelectedAmount = item => formatAmount((item.currency || 'pkr').toUpperCase(), item.selectedTotal ?? item.totalPkr);

    const sumItems = items => items.reduce((totals, item) => ({
        pkr: totals.pkr + Number(item.totalPkr || 0),
        usd: totals.usd + Number(item.totalUsd || 0),
        gbp: totals.gbp + Number(item.totalGbp || 0)
    }), { pkr: 0, usd: 0, gbp: 0 });

    const clearAlert = () => {
        alertBox.textContent = '';
        alertBox.classList.remove('is-visible');
    };

    const showAlert = message => {
        alertBox.textContent = message;
        alertBox.classList.add('is-visible');
    };

    const updateTypePanels = () => {
        const type = getQurbaniType();
        waqfPanel.classList.toggle('is-hidden', type !== 'waqf');
        collectionPanel.classList.toggle('is-hidden', type !== 'collection');
    };

    const updatePricing = () => {
        const packageData = getSelectedPackage();
        const quantity = getQuantity();
        if (String(quantityInput.value) !== String(quantity)) quantityInput.value = quantity;

        const totals = getTotals();
        document.getElementById('price-pkr-display').textContent = packageData ? formatAmount('PKR', packageData.pkr) : 'PKR 0';
        document.getElementById('foreign-price-display').innerHTML = packageData ? `<span>${formatAmount('USD', packageData.usd)}</span><span>${formatAmount('GBP', packageData.gbp)}</span>` : '<span>USD 0</span><span>GBP 0</span>';
        document.getElementById('selected-total-label').textContent = `Total ${getSelectedCurrency().toUpperCase()}`;
        document.getElementById('total-pkr-display').textContent = formatSelectedAmount(totals);
        document.getElementById('total-usd-display').textContent = formatAmount('USD', totals.usd);
        document.getElementById('total-gbp-display').textContent = formatAmount('GBP', totals.gbp);
    };

    const buildCurrentItem = () => {
        const packageData = getSelectedPackage();
        const type = getQurbaniType();
        const totals = getTotals();
        return {
            package: packageData?.name || '',
            type: type === 'waqf' ? 'Waqf (Donation)' : 'Collection',
            waqfFor: type === 'waqf' ? document.getElementById('waqf-for').value : 'Collection',
            collectionAddress: 'Institute of Islamic Sciences, Islamabad, Wadi-e-ilm, Toll Plaza, Main Murree Rd, Islamabad, Pakistan',
            qurbaniBy: '',
            quantity: getQuantity(),
            totalPkr: totals.pkr,
            totalUsd: totals.usd,
            totalGbp: totals.gbp,
            currency: getSelectedCurrency(),
            selectedTotal: totals[getSelectedCurrency()]
        };
    };

    const getPersonalData = () => ({
        fullName: document.getElementById('full-name').value.trim(),
        contactNumber: document.getElementById('contact-number').value.trim(),
        otherContact: document.getElementById('other-contact').value.trim(),
        email: '',
        country: document.getElementById('country').value.trim(),
        city: '',
        address: document.getElementById('address').value.trim()
    });

    const renderAddedItems = () => {
        if (!addedItemsPanel || !addedItemsList) return;
        addedItemsPanel.hidden = false;

        if (orderItems.length === 0) {
            addedItemsList.innerHTML = '<p class="qurbani-empty-summary">Your selected item will appear here.</p>';
            return;
        }

        const totals = sumItems(orderItems);
        const rows = orderItems.map((item, index) => {
            const isGoat = item.package.toLowerCase().includes('goat');
            const imageSrc = isGoat ? 'image/goat.jpg' : 'image/cow.jpg';
            const detail = item.type === 'Waqf (Donation)' ? item.waqFor || item.waqfFor : 'Collection';
            const editing = item.editing === true;
            const packageCell = editing ? '<select class="qurbani-row-package" data-edit-package="' + index + '">' + qurbaniPackages.map(packageItem => '<option value="' + packageItem.id + '" ' + (packageItem.name === item.package ? 'selected' : '') + '>' + packageItem.name + '</option>').join('') + '</select>' : '<div class="qurbani-order-package"><img src="' + imageSrc + '" alt="' + escapeHtml(item.package) + '"><span>' + escapeHtml(item.package) + '</span></div>';
            const typeCell = editing ? '<select class="qurbani-row-type" data-edit-type="' + index + '"><option value="Waqf (Donation)" ' + (item.type === 'Waqf (Donation)' ? 'selected' : '') + '>Waqf</option><option value="Collection" ' + (item.type === 'Collection' ? 'selected' : '') + '>Collection</option></select>' : escapeHtml(item.type);
            const detailCell = editing ? '<select class="qurbani-row-waqf" data-edit-waqf="' + index + '" ' + (item.type === 'Collection' ? 'disabled' : '') + '><option value="Students of the Institute" ' + (item.waqfFor === 'Students of the Institute' ? 'selected' : '') + '>Students of the Institute</option><option value="Needy & Deserving" ' + (item.waqfFor === 'Needy & Deserving' ? 'selected' : '') + '>Needy & Deserving</option></select>' : escapeHtml(detail);
            const quantityCell = editing ? '<input class="qurbani-row-qty" type="number" min="1" value="' + escapeHtml(item.quantity) + '" data-edit-qty="' + index + '">' : escapeHtml(item.quantity);
            const actionCell = editing ? '<div class="qurbani-table-actions"><button type="button" class="qurbani-table-save" data-save-item="' + index + '">Save</button><button type="button" class="qurbani-table-remove" data-cancel-edit="' + index + '">Cancel</button></div>' : '<div class="qurbani-table-actions"><button type="button" class="qurbani-table-edit" data-edit-item="' + index + '">Edit</button><button type="button" class="qurbani-table-remove" data-remove-item="' + index + '">Remove</button></div>';
            return '<div class="qurbani-order-grid-row"><div><input class="qurbani-inline-name" type="text" value="' + escapeHtml(item.qurbaniBy) + '" placeholder="e.g. Muhammad Ali" data-item-name="' + index + '"></div><div>' + packageCell + '</div><div>' + typeCell + '</div><div>' + detailCell + '</div><div>' + quantityCell + '</div><div>' + getItemSelectedAmount(item) + '</div><div>' + actionCell + '</div></div>';
        }).join('');

        addedItemsList.innerHTML = '<p class="table-scroll-helper">Swipe table to view full order details.</p><div class="qurbani-order-grid-wrap table-scroll-wrapper"><div class="qurbani-order-grid"><div class="qurbani-order-grid-head"><div>Qurbani By</div><div>Package</div><div>Type</div><div>Waqf / Collection</div><div>Quantity</div><div>Total</div><div>Action</div></div>' + rows + '<div class="qurbani-order-grid-foot"><div>Order Totals</div><div>' + formatSelectedAmount(totals) + '</div><div></div></div></div></div>';
    };
    const resetItemFields = () => {
        pendingItemKey = '';
        document.querySelectorAll('input[name="qurbaniPackage"]').forEach(input => input.checked = false);
        document.querySelector('input[name="qurbaniType"][value="waqf"]').checked = true;
        document.getElementById('waqf-for').value = 'Students of the Institute';
        quantityInput.value = 1;

        updateTypePanels();
        updatePricing();
        updateSummary();
    };

    const getAllItemsForReview = () => [...orderItems];

    const updateSummary = () => {
        const summary = document.getElementById('order-summary');
        const personal = getPersonalData();
        const reviewItems = getAllItemsForReview();
        const totals = sumItems(reviewItems);
        const itemsHtml = reviewItems.length ? reviewItems.map((item, index) => {
            const detail = item.type === 'Waqf (Donation)' ? item.waqfFor : item.collectionAddress;
            return `<div class="qurbani-summary-line"><span>${index + 1}. ${escapeHtml(item.package)}</span><strong>${getItemSelectedAmount(item)}</strong><small>${escapeHtml(item.type)} ? ${escapeHtml(detail)} ? Qty ${escapeHtml(item.quantity)} ? ${escapeHtml(item.qurbaniBy)}</small></div>`;
        }).join('') : '<p>No Qurbani items added yet.</p>';

        summary.innerHTML = `
            <div class="qurbani-summary-items">${itemsHtml}</div>
            <div class="qurbani-summary-grid">
                <div class="qurbani-summary-item qurbani-highlight"><span>Total ${getSelectedCurrency().toUpperCase()}</span><strong>${formatSelectedAmount(totals)}</strong></div>
                <div class="qurbani-summary-item"><span>Full Name</span><strong>${escapeHtml(personal.fullName)}</strong></div>
                <div class="qurbani-summary-item"><span>Contact Number</span><strong>${escapeHtml(personal.contactNumber)}</strong></div>
                <div class="qurbani-summary-item"><span>Other Contact Number</span><strong>${escapeHtml(personal.otherContact || '—')}</strong></div>
                <div class="qurbani-summary-item"><span>Country</span><strong>${escapeHtml(personal.country)}</strong></div>
                <div class="qurbani-summary-item"><span>Address</span><strong>${escapeHtml(personal.address || '-' )}</strong></div>
            </div>`;
        renderAddedItems();
    };

    const isEmailValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateStep = stepIndex => {
        if (stepIndex === 0 && !getSelectedPackage()) return 'Please select a Qurbani package to continue.';
        if (stepIndex === 1) {
            if (!getQurbaniType()) return 'Please select a Qurbani type.';
            if (getQurbaniType() === 'waqf' && !document.getElementById('waqf-for').value) return 'Please select who this Waqf is for.';
        }
        if (stepIndex === 2 && getQuantity() < 1) return 'Please enter a valid quantity.';
        if (stepIndex === 3 && orderItems.length === 0) return 'Please add this item to the order.';
        if (stepIndex === 3 && orderItems.some(item => !item.qurbaniBy.trim())) return 'Please enter Qurbani By for each added item.';
        if (stepIndex === 4) {
            const requiredFields = [
                ['full-name', 'Please enter your full name.'],
                ['contact-number', 'Please enter your contact number.'],
                ['country', 'Please enter your country.']
            ];
            for (const [id, message] of requiredFields) {
                if (!document.getElementById(id).value.trim()) return message;
            }
            const contactNumber = document.getElementById('contact-number').value;
            const otherContact = document.getElementById('other-contact').value;
            if (!isValidContactNumber(contactNumber)) return 'Please enter a valid contact number with 9 to 14 digits.';
            if (otherContact.trim() && !isValidContactNumber(otherContact)) return 'Please enter a valid other contact number with 9 to 14 digits.';

        }
        return '';
    };

    const setStep = stepIndex => {
        currentStep = Math.max(0, Math.min(stepIndex, steps.length - 1));
        steps.forEach((step, index) => step.classList.toggle('is-active', index === currentStep));
        navButtons.forEach((button, index) => {
            button.classList.toggle('is-active', index === currentStep);
            button.classList.toggle('is-complete', index < highestStep);
            button.disabled = index > highestStep;
        });
        previousButton.disabled = currentStep === 0;
        nextButton.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-flex';
        if (currentStep === 3 && getSelectedPackage()) {
            const currentItem = buildCurrentItem();
            const currentKey = [currentItem.package, currentItem.type, currentItem.waqfFor, currentItem.quantity, currentItem.totalPkr].join('|');
            if (currentKey !== pendingItemKey) {
                orderItems.push(currentItem);
                pendingItemKey = currentKey;
            }
        }
        clearAlert();
        updateTypePanels();
        updatePricing();
        updateSummary();
        document.querySelector('.qurbani-wizard-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goNext = () => {
        const error = validateStep(currentStep);
        if (error) {
            showAlert(error);
            return;
        }
        highestStep = Math.max(highestStep, currentStep + 1);
        setStep(currentStep + 1);
    };


    const submitOrder = event => {
        event.preventDefault();
        for (let stepIndex = 0; stepIndex <= 4; stepIndex += 1) {
            const error = validateStep(stepIndex);
            if (error) {
                highestStep = Math.max(highestStep, stepIndex);
                setStep(stepIndex);
                showAlert(error);
                return;
            }
        }
        const finalItems = getAllItemsForReview();
        if (finalItems.length === 0) {
            setStep(0);
            showAlert('Please add at least one Qurbani item.');
            return;
        }
        const personal = getPersonalData();
        localStorage.setItem('orderData', JSON.stringify({
            trackingId: generateTrackingId(),
            fullName: personal.fullName,
            contactNumber: personal.contactNumber,
            otherContact: personal.otherContact,
            email: personal.email,
            country: personal.country,
            city: personal.city,
            address: personal.address,
            items: finalItems.map(item => ({
                package: item.package,
                type: item.type,
                waqfFor: item.waqfFor,
                qurbaniBy: item.qurbaniBy,
                quantity: item.quantity,
                totalPkr: item.totalPkr,
                totalUsd: item.totalUsd,
                totalGbp: item.totalGbp
            }))
        }));
        window.location.href = 'token.html';
    };

    document.querySelectorAll('input[name="qurbaniPackage"], input[name="qurbaniType"]').forEach(input => {
        input.addEventListener('change', () => {
            clearAlert();
            updateTypePanels();
            updatePricing();
            updateSummary();
        });
    });
    document.querySelectorAll('#qurbani-wizard input:not([data-item-name]), #qurbani-wizard select, #qurbani-wizard textarea').forEach(input => {
        input.addEventListener('input', () => {
            clearAlert();
            updatePricing();
            updateSummary();
        });
    });
    document.getElementById('increase-quantity').addEventListener('click', () => {
        quantityInput.value = getQuantity() + 1;
        clearAlert();
        updatePricing();
        updateSummary();
    });
    document.getElementById('decrease-quantity').addEventListener('click', () => {
        quantityInput.value = Math.max(1, getQuantity() - 1);
        clearAlert();
        updatePricing();
        updateSummary();
    });
    currencySelect.addEventListener('change', () => {
        updatePricing();
        updateSummary();
    });

    currencyToggle.addEventListener('click', () => {
        const shouldShow = foreignTotals.hasAttribute('hidden');
        foreignTotals.toggleAttribute('hidden', !shouldShow);
        currencyToggle.setAttribute('aria-expanded', String(shouldShow));
        currencyToggle.textContent = shouldShow ? 'Hide USD / GBP totals' : 'Show USD / GBP totals';
    });
    chooseAnotherButton.addEventListener('click', () => {
        resetItemFields();
        setStep(0);
        showAlert('Please choose the next animal.');
    });
    addedItemsList.addEventListener('input', event => {
        const nameInput = event.target.closest('[data-item-name]');
        if (!nameInput) return;
        orderItems[Number(nameInput.dataset.itemName)].qurbaniBy = nameInput.value;
        clearAlert();
    });

    addedItemsList.addEventListener('click', event => {
        const editButton = event.target.closest('[data-edit-item]');
        if (editButton) {
            orderItems[Number(editButton.dataset.editItem)].editing = true;
            updateSummary();
            return;
        }

        const cancelButton = event.target.closest('[data-cancel-edit]');
        if (cancelButton) {
            orderItems[Number(cancelButton.dataset.cancelEdit)].editing = false;
            updateSummary();
            return;
        }

        const saveButton = event.target.closest('[data-save-item]');
        if (saveButton) {
            orderItems[Number(saveButton.dataset.saveItem)].editing = false;
            updateSummary();
            return;
        }

        const removeButton = event.target.closest('[data-remove-item]');
        if (!removeButton) return;
        orderItems.splice(Number(removeButton.dataset.removeItem), 1);
        updateSummary();
    });
    previousButton.addEventListener('click', () => setStep(currentStep - 1));
    nextButton.addEventListener('click', goNext);
    wizard.addEventListener('submit', submitOrder);
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetStep = parseInt(button.dataset.stepTarget, 10);
            if (targetStep <= highestStep) setStep(targetStep);
        });
    });

    updateTypePanels();
    setStep(0);
}
document.addEventListener('DOMContentLoaded', function() {
    initQurbaniWizard();

    const submitSkinBtn = document.getElementById('submit-skin-btn');
    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');

    if (submitSkinBtn) submitSkinBtn.addEventListener('click', submitSkinCollection);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadToken);
    if (printBtn) printBtn.addEventListener('click', printToken);

    if (window.location.pathname.includes('token.html')) {
        loadTokenPage();
    }
});

















