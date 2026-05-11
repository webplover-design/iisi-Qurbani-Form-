const qurbaniPackages = [
    { id: "waqf-cow-share-30000", type: "waqf", name: "Cow Per Share", pkr: 30000, image: "image/cow.jpg" },
    { id: "waqf-cow-share-35000", type: "waqf", name: "Cow Per Share", pkr: 35000, image: "image/cow.jpg" },
    { id: "waqf-full-cow", type: "waqf", name: "Full Cow (7 Shares)", pkr: 210000, image: "image/cow.jpg" },
    { id: "waqf-goat", type: "waqf", name: "Goat", pkr: 50000, image: "image/goat.jpg" },
    { id: "collection-cow-share-35000", type: "collection", name: "Cow Per Share", pkr: 35000, image: "image/cow.jpg" },
    { id: "collection-full-cow", type: "collection", name: "Full Cow (7 Shares)", pkr: 210000, image: "image/cow.jpg" },
    { id: "collection-goat", type: "collection", name: "Goat", pkr: 50000, image: "image/goat.jpg" }
].map(packageData => ({ ...packageData, ...convertPkrPrice(packageData.pkr) }));

const bankDetails = {
    accounts: [
        { bankName: "Meezan Bank", accountTitle: "M.Abdul Basit", accountNumber: "03810101515055", iban: "PK10MEZN0003810101515055" },
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

function convertPkrPrice(pkr) {
    return {
        usd: Math.round((pkr / 30000) * 108),
        gbp: Math.round((pkr / 30000) * 85)
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
        let html = '<table><thead><tr><th>Package</th><th>Type</th><th>Waqf / Collection</th><th>Income Source</th><th>Qurbani By</th><th>Total PKR</th><th>Total USD</th><th>Total GBP</th></tr></thead><tbody>';
        orderData.items.forEach(item => {
            html += '<tr>' +
                '<td>' + escapeHtml(item.package) + '</td>' +
                '<td>' + escapeHtml(item.type) + '</td>' +
                '<td>' + escapeHtml(item.incomeSource || '-') + '</td>' +
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
    const orderLines = orderData.items.map(item => item.package + ' - ' + item.type + ' - Income Source: ' + (item.incomeSource || '-') + ' - Qty: ' + item.quantity + ' - Total PKR: ' + item.totalPkr).join('\n');
    const whatsappMessage = 'Tracking ID: ' + orderData.trackingId + '\nCustomer Name: ' + orderData.fullName + '\nContact: ' + orderData.contactNumber + '\nAddress: ' + orderData.address + ', ' + orderData.city + ', ' + orderData.country + '\n\nOrder Details:\n' + orderLines + '\n\nI want to send my payment receipt for confirmation.';
    const whatsappHref = 'https://wa.me/923365363550?text=' + encodeURIComponent(whatsappMessage);
    if (whatsappLink) whatsappLink.href = whatsappHref;
    if (receiptWhatsappButton) receiptWhatsappButton.href = whatsappHref;
}
async function downloadToken(event) {
    if (event) event.preventDefault();
    const orderData = JSON.parse(localStorage.getItem('orderData'));
    const tokenCard = document.querySelector('.token-section');
    const downloadButton = document.getElementById('download-btn');
    if (!orderData || !tokenCard) return;
    if (typeof html2canvas === 'undefined') {
        alert('Download tool is still loading. Please refresh the page and try again.');
        return;
    }

    const previousText = downloadButton ? downloadButton.textContent : '';
    if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.textContent = 'Preparing...';
    }

    const clone = tokenCard.cloneNode(true);
    clone.classList.add('receipt-download-clone');
    clone.querySelector('.cta-buttons')?.remove();
    clone.querySelectorAll('img').forEach(image => image.remove());
    const header = document.createElement('div');
    header.className = 'receipt-download-header';
    header.innerHTML = '<strong>Institute of Islamic Sciences, Islamabad</strong><span>Online Qurbani Receipt</span>';
    clone.prepend(header);
    document.body.appendChild(clone);

    try {
        const canvas = await html2canvas(clone, {
            backgroundColor: '#fffbf2',
            scale: 2,
            useCORS: false,
            allowTaint: false,
            logging: false
        });
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'qurbani-token-' + orderData.trackingId + '.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (error) {
        console.error('Token download failed:', error);
        alert('Download failed: ' + (error && error.message ? error.message : 'Unknown error') + '. Please use Print Token.');
    } finally {
        clone.remove();
        if (downloadButton) {
            downloadButton.disabled = false;
            downloadButton.textContent = previousText;
        }
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
    let selectedPackages = {};
    let orderItems = [];

    const steps = Array.from(document.querySelectorAll('.qurbani-wizard-step'));
    const navButtons = Array.from(document.querySelectorAll('.qurbani-step-nav'));
    const alertBox = document.getElementById('qurbani-alert');
    const previousButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    const collectionPanel = document.getElementById('collection-options-panel');
    const currencySelect = document.getElementById('currency-select');
    const packageGrid = document.getElementById('package-options-grid');
    const packageTotal = document.getElementById('package-selection-total');
    const addedItemsPanel = document.getElementById('added-items-panel');
    const addedItemsList = document.getElementById('added-items-list');

    const getQurbaniType = () => document.querySelector('input[name="qurbaniType"]:checked')?.value || 'waqf-students';
    const getPackageType = () => getQurbaniType() === 'collection' ? 'collection' : 'waqf';
    const getWaqfFor = () => getQurbaniType() === 'waqf-needy' ? 'Needy & Deserving' : 'Students of the Institute';
    const getSelectedCurrency = () => currencySelect?.value || 'pkr';
    const getPackagesForType = () => qurbaniPackages.filter(packageData => packageData.type === getPackageType());
    const getPackageById = id => qurbaniPackages.find(packageData => packageData.id === id);
    const getPackageAmount = packageData => packageData?.[getSelectedCurrency()] || 0;
    const formatPackageAmount = packageData => formatAmount(getSelectedCurrency().toUpperCase(), getPackageAmount(packageData));
    const sumItems = items => items.reduce((totals, item) => ({
        pkr: totals.pkr + Number(item.totalPkr || 0),
        usd: totals.usd + Number(item.totalUsd || 0),
        gbp: totals.gbp + Number(item.totalGbp || 0)
    }), { pkr: 0, usd: 0, gbp: 0 });
    const formatSelectedTotal = totals => formatAmount(getSelectedCurrency().toUpperCase(), totals[getSelectedCurrency()]);

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
        collectionPanel.classList.toggle('is-hidden', type !== 'collection');
    };

    const resetPackageSelectionForType = () => {
        const allowedIds = new Set(getPackagesForType().map(packageData => packageData.id));
        selectedPackages = Object.fromEntries(Object.entries(selectedPackages).filter(([packageId]) => allowedIds.has(packageId)));
    };

    const renderPackageCards = () => {
        if (!packageGrid) return;
        const currency = getSelectedCurrency();
        const packagesForType = getPackagesForType();
        packageGrid.style.gridTemplateColumns = window.matchMedia('(min-width: 1024px)').matches ? 'repeat(' + packagesForType.length + ', minmax(0, 1fr))' : '';
        packageGrid.innerHTML = packagesForType.map(packageData => {
            const selected = selectedPackages[packageData.id];
            const quantity = selected?.quantity || 1;
            return '<label class="qurbani-choice-card qurbani-package-card qurbani-multi-package-card ' + (selected ? 'is-selected' : '') + '">' +
                '<input type="checkbox" name="qurbaniPackage" value="' + escapeHtml(packageData.id) + '" ' + (selected ? 'checked' : '') + '>' +
                '<img class="qurbani-package-image" src="' + escapeHtml(packageData.image) + '" alt="' + escapeHtml(packageData.name) + '">' +
                '<strong>' + escapeHtml(packageData.name) + '</strong>' +
                '<em>' + escapeHtml(formatPackageAmount(packageData)) + '</em>' +
                '<div class="qurbani-card-quantity" ' + (selected ? '' : 'hidden') + '>' +
                    '<span>Quantity</span>' +
                    '<div class="qurbani-quantity-control qurbani-card-quantity-control">' +
                        '<button type="button" data-package-decrease="' + escapeHtml(packageData.id) + '" aria-label="Decrease quantity">−</button>' +
                        '<input type="number" min="1" value="' + escapeHtml(quantity) + '" data-package-quantity="' + escapeHtml(packageData.id) + '" inputmode="numeric">' +
                        '<button type="button" data-package-increase="' + escapeHtml(packageData.id) + '" aria-label="Increase quantity">+</button>' +
                    '</div>' +
                '</div>' +
            '</label>';
        }).join('');
        renderPackageTotal();
    };

    const getSelectedPackageEntries = () => Object.entries(selectedPackages).map(([packageId, selected]) => ({
        packageData: getPackageById(packageId),
        quantity: Math.max(1, parseInt(selected.quantity, 10) || 1)
    })).filter(entry => entry.packageData);

    const renderPackageTotal = () => {
        if (!packageTotal) return;
        const entries = getSelectedPackageEntries();
        if (entries.length === 0) {
            packageTotal.textContent = 'No packages selected yet.';
            return;
        }
        const totals = entries.reduce((sum, entry) => sum + getPackageAmount(entry.packageData) * entry.quantity, 0);
        const count = entries.reduce((sum, entry) => sum + entry.quantity, 0);
        packageTotal.innerHTML = '<span>Selected Qurbani Units: <strong>' + count + '</strong></span><span>Total: <strong>' + escapeHtml(formatAmount(getSelectedCurrency().toUpperCase(), totals)) + '</strong></span>';
    };

    const syncOrderItemsFromSelections = () => {
        const existing = orderItems;
        const nextItems = [];
        const type = getQurbaniType();
        const typeLabel = type === 'collection' ? 'Collection' : 'Waqf (Donation)';
        const detail = type === 'collection' ? 'Collection' : getWaqfFor();
        getSelectedPackageEntries().forEach(entry => {
            for (let index = 0; index < entry.quantity; index += 1) {
                const key = entry.packageData.id + '-' + index;
                const previous = existing.find(item => item.itemKey === key);
                nextItems.push({
                    itemKey: key,
                    packageId: entry.packageData.id,
                    package: entry.packageData.name,
                    type: typeLabel,
                    waqfFor: detail,
                    incomeSource: previous?.incomeSource || '',
                    qurbaniBy: previous?.qurbaniBy || '',
                    quantity: 1,
                    totalPkr: entry.packageData.pkr,
                    totalUsd: entry.packageData.usd,
                    totalGbp: entry.packageData.gbp,
                    currency: getSelectedCurrency(),
                    selectedTotal: getPackageAmount(entry.packageData)
                });
            }
        });
        orderItems = nextItems;
    };

    const renderAddedItems = () => {
        if (!addedItemsPanel || !addedItemsList) return;
        addedItemsPanel.hidden = false;
        if (orderItems.length === 0) {
            addedItemsList.innerHTML = '<p class="qurbani-empty-summary">Your selected Qurbani rows will appear here.</p>';
            return;
        }
        const editIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25zm15.92-10.43c.36-.36.36-.94 0-1.3l-1.44-1.44a.92.92 0 0 0-1.3 0l-1.13 1.13 2.75 2.75 1.12-1.14z"/></svg>';
        const trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 4l1-1h6l1 1h4v2H4V4h4z"/></svg>';
        const saveIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
        const cancelIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29 10.59 10.59 16.89 4.29z"/></svg>';
        const totals = sumItems(orderItems);
        const rows = orderItems.map((item, index) => {
            const packageData = getPackageById(item.packageId);
            const imageSrc = packageData?.image || (item.package.toLowerCase().includes('goat') ? 'image/goat.jpg' : 'image/cow.jpg');
            const amount = formatAmount(getSelectedCurrency().toUpperCase(), item[getSelectedCurrency() === 'pkr' ? 'totalPkr' : getSelectedCurrency() === 'usd' ? 'totalUsd' : 'totalGbp']);
            const isEditing = item.editing === true;
            const packageOptions = qurbaniPackages.filter(packageItem => packageItem.type === (item.type === 'Collection' ? 'collection' : 'waqf'));
            const packageCell = isEditing ? '<select class="qurbani-row-package" data-row-package="' + index + '">' + packageOptions.map(packageItem => '<option value="' + escapeHtml(packageItem.id) + '" ' + (packageItem.id === item.packageId ? 'selected' : '') + '>' + escapeHtml(packageItem.name) + ' - PKR ' + Number(packageItem.pkr).toLocaleString('en-US') + '</option>').join('') + '</select>' : '<div class="qurbani-order-package"><img src="' + imageSrc + '" alt="' + escapeHtml(item.package) + '"><span>' + escapeHtml(item.package) + '</span></div>';
            const detailCell = isEditing ? '<select class="qurbani-row-waqf" data-row-waqf="' + index + '"><option value="Students of the Institute" ' + (item.waqfFor === 'Students of the Institute' ? 'selected' : '') + '>Students of the Institute</option><option value="Needy & Deserving" ' + (item.waqfFor === 'Needy & Deserving' ? 'selected' : '') + '>Needy & Deserving</option><option value="Collection" ' + (item.waqfFor === 'Collection' ? 'selected' : '') + '>Collection</option></select>' : escapeHtml(item.waqfFor);
            const actionCell = isEditing ? '<div class="qurbani-table-actions"><button type="button" class="qurbani-table-save qurbani-icon-btn" data-save-item="' + index + '" aria-label="Save item" title="Save">' + saveIcon + '</button><button type="button" class="qurbani-table-remove qurbani-icon-btn" data-cancel-edit="' + index + '" aria-label="Cancel edit" title="Cancel">' + cancelIcon + '</button></div>' : '<div class="qurbani-table-actions"><button type="button" class="qurbani-table-edit qurbani-icon-btn" data-edit-item="' + index + '" aria-label="Edit item" title="Edit">' + editIcon + '</button><button type="button" class="qurbani-table-remove qurbani-icon-btn" data-remove-item="' + index + '" aria-label="Remove item" title="Remove">' + trashIcon + '</button></div>';
            return '<div class="qurbani-order-grid-row">' +
                '<div><input class="qurbani-inline-name" type="text" value="' + escapeHtml(item.qurbaniBy) + '" placeholder="e.g. Muhammad Ali" data-item-name="' + index + '"></div>' +
                '<div><input class="qurbani-inline-income" type="text" value="' + escapeHtml(item.incomeSource || '') + '" placeholder="e.g. Business, Salary" data-item-income="' + index + '"></div>' +
                '<div>' + packageCell + '</div>' +
                '<div>' + detailCell + '</div>' +
                '<div>' + escapeHtml(amount) + '</div>' +
                '<div>' + actionCell + '</div>' +
            '</div>';
        }).join('');
        addedItemsList.innerHTML = '<p class="table-scroll-helper">Swipe table to view full order details.</p><div class="qurbani-order-grid-wrap table-scroll-wrapper"><div class="qurbani-order-grid qurbani-order-grid-no-qty"><div class="qurbani-order-grid-head"><div>Qurbani By</div><div>Income Source</div><div>Package</div><div>Waqf / Collection</div><div>Total</div><div>Action</div></div>' + rows + '<div class="qurbani-order-grid-foot"><div>Order Totals</div><div>' + formatSelectedTotal(totals) + '</div><div></div></div></div></div>';
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

    const updateSummary = () => {
        const summary = document.getElementById('order-summary');
        if (!summary) return;
        const personal = getPersonalData();
        const totals = sumItems(orderItems);
        const itemsHtml = orderItems.length ? orderItems.map((item, index) => '<div class="qurbani-summary-line"><span>' + (index + 1) + '. ' + escapeHtml(item.package) + '</span><strong>' + escapeHtml(formatAmount(getSelectedCurrency().toUpperCase(), item[getSelectedCurrency() === 'pkr' ? 'totalPkr' : getSelectedCurrency() === 'usd' ? 'totalUsd' : 'totalGbp'])) + '</strong><small>' + escapeHtml(item.type) + ' · ' + escapeHtml(item.waqfFor) + ' · Qurbani By: ' + escapeHtml(item.qurbaniBy || '-') + ' · Income Source: ' + escapeHtml(item.incomeSource || '-') + '</small></div>').join('') : '<p>No Qurbani items added yet.</p>';
        summary.innerHTML = '<div class="qurbani-summary-items">' + itemsHtml + '</div><div class="qurbani-summary-grid">' +
            '<div class="qurbani-summary-item qurbani-highlight"><span>Total ' + getSelectedCurrency().toUpperCase() + '</span><strong>' + escapeHtml(formatSelectedTotal(totals)) + '</strong></div>' +
            '<div class="qurbani-summary-item"><span>Full Name</span><strong>' + escapeHtml(personal.fullName) + '</strong></div>' +
            '<div class="qurbani-summary-item"><span>Contact Number</span><strong>' + escapeHtml(personal.contactNumber) + '</strong></div>' +
            '<div class="qurbani-summary-item"><span>Other Contact Number</span><strong>' + escapeHtml(personal.otherContact || '—') + '</strong></div>' +
            '<div class="qurbani-summary-item"><span>Country</span><strong>' + escapeHtml(personal.country) + '</strong></div>' +
            '<div class="qurbani-summary-item"><span>Address</span><strong>' + escapeHtml(personal.address || '-') + '</strong></div>' +
            '</div>';
        renderAddedItems();
    };

    const validateStep = stepIndex => {
        if (stepIndex === 0) {
            if (!getQurbaniType()) return 'Please select a Qurbani type.';
            if (!getSelectedCurrency()) return 'Please select a currency.';

        }
        if (stepIndex === 1) {
            const entries = getSelectedPackageEntries();
            if (entries.length === 0) return 'Please select at least one Qurbani package.';
            if (entries.some(entry => entry.quantity < 1)) return 'Please enter a valid quantity for every selected package.';
        }
        if (stepIndex === 2) {
            if (orderItems.length === 0) syncOrderItemsFromSelections();
            if (orderItems.length === 0) return 'Please select at least one Qurbani package.';
            if (orderItems.some(item => !item.qurbaniBy.trim())) return 'Please enter Qurbani By for each item.';
            if (orderItems.some(item => !(item.incomeSource || '').trim())) return 'Please enter income source for each item.';
        }
        if (stepIndex === 3) {
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
        if (currentStep === 2 && orderItems.length === 0) syncOrderItemsFromSelections();
        steps.forEach((step, index) => step.classList.toggle('is-active', index === currentStep));
        navButtons.forEach((button, index) => {
            button.classList.toggle('is-active', index === currentStep);
            button.classList.toggle('is-complete', index < highestStep);
            button.disabled = index > highestStep;
        });
        previousButton.disabled = currentStep === 0;
        nextButton.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-flex';
        clearAlert();
        updateTypePanels();
        renderPackageCards();
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
        for (let stepIndex = 0; stepIndex <= 3; stepIndex += 1) {
            const error = validateStep(stepIndex);
            if (error) {
                highestStep = Math.max(highestStep, stepIndex);
                setStep(stepIndex);
                showAlert(error);
                return;
            }
        }
        syncOrderItemsFromSelections();
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
            currency: getSelectedCurrency(),
            items: orderItems.map(item => ({
                package: item.package,
                type: item.type,
                waqfFor: item.waqfFor,
                incomeSource: item.incomeSource,
                qurbaniBy: item.qurbaniBy,
                quantity: 1,
                totalPkr: item.totalPkr,
                totalUsd: item.totalUsd,
                totalGbp: item.totalGbp,
                currency: getSelectedCurrency(),
                selectedTotal: item.selectedTotal
            }))
        }));
        window.location.href = 'token.html';
    };

    document.querySelectorAll('input[name="qurbaniType"]').forEach(input => {
        input.addEventListener('change', () => {
            clearAlert();
            resetPackageSelectionForType();
            orderItems = [];
            highestStep = Math.min(highestStep, 1);
            updateTypePanels();
            renderPackageCards();
            updateSummary();
        });
    });

    currencySelect.addEventListener('change', () => {
        clearAlert();
        syncOrderItemsFromSelections();
        renderPackageCards();
        updateSummary();
    });

    packageGrid.addEventListener('change', event => {
        const checkbox = event.target.closest('input[name="qurbaniPackage"]');
        const quantityInput = event.target.closest('[data-package-quantity]');
        if (checkbox) {
            if (checkbox.checked) selectedPackages[checkbox.value] = { quantity: selectedPackages[checkbox.value]?.quantity || 1 };
            else delete selectedPackages[checkbox.value];
            clearAlert();
            syncOrderItemsFromSelections();
            renderPackageCards();
            updateSummary();
            return;
        }
        if (quantityInput) {
            const packageId = quantityInput.dataset.packageQuantity;
            if (!selectedPackages[packageId]) return;
            selectedPackages[packageId].quantity = Math.max(1, parseInt(quantityInput.value, 10) || 1);
            syncOrderItemsFromSelections();
            renderPackageTotal();
            updateSummary();
        }
    });

    packageGrid.addEventListener('click', event => {
        const increase = event.target.closest('[data-package-increase]');
        const decrease = event.target.closest('[data-package-decrease]');
        const packageId = increase?.dataset.packageIncrease || decrease?.dataset.packageDecrease;
        if (!packageId || !selectedPackages[packageId]) return;
        event.preventDefault();
        event.stopPropagation();
        const current = Math.max(1, parseInt(selectedPackages[packageId].quantity, 10) || 1);
        selectedPackages[packageId].quantity = increase ? current + 1 : Math.max(1, current - 1);
        clearAlert();
        syncOrderItemsFromSelections();
        renderPackageCards();
        updateSummary();
    });

    addedItemsList.addEventListener('input', event => {
        const nameInput = event.target.closest('[data-item-name]');
        if (nameInput) {
            orderItems[Number(nameInput.dataset.itemName)].qurbaniBy = nameInput.value;
            clearAlert();
            return;
        }
        const incomeInput = event.target.closest('[data-item-income]');
        if (!incomeInput) return;
        orderItems[Number(incomeInput.dataset.itemIncome)].incomeSource = incomeInput.value;
        clearAlert();
    });

    addedItemsList.addEventListener('change', event => {
        const packageSelect = event.target.closest('[data-row-package]');
        const waqfSelect = event.target.closest('[data-row-waqf]');
        if (packageSelect) {
            const item = orderItems[Number(packageSelect.dataset.rowPackage)];
            const packageData = getPackageById(packageSelect.value);
            if (!item || !packageData) return;
            item.packageId = packageData.id;
            item.package = packageData.name;
            item.totalPkr = packageData.pkr;
            item.totalUsd = packageData.usd;
            item.totalGbp = packageData.gbp;
            item.selectedTotal = getPackageAmount(packageData);
            updateSummary();
            return;
        }
        if (waqfSelect) {
            const item = orderItems[Number(waqfSelect.dataset.rowWaqf)];
            if (!item) return;
            item.waqfFor = waqfSelect.value;
            item.type = waqfSelect.value === 'Collection' ? 'Collection' : 'Waqf (Donation)';
            updateSummary();
        }
    });

    addedItemsList.addEventListener('click', event => {
        const removeButton = event.target.closest('[data-remove-item]');
        const editButton = event.target.closest('[data-edit-item]');
        const saveButton = event.target.closest('[data-save-item]');
        const cancelButton = event.target.closest('[data-cancel-edit]');
        if (editButton) {
            orderItems[Number(editButton.dataset.editItem)].editing = true;
            renderAddedItems();
            return;
        }
        if (saveButton) {
            orderItems[Number(saveButton.dataset.saveItem)].editing = false;
            updateSummary();
            return;
        }
        if (cancelButton) {
            orderItems[Number(cancelButton.dataset.cancelEdit)].editing = false;
            renderAddedItems();
            return;
        }
        if (!removeButton) return;
        const item = orderItems[Number(removeButton.dataset.removeItem)];
        if (!item || !selectedPackages[item.packageId]) return;
        selectedPackages[item.packageId].quantity = Math.max(0, selectedPackages[item.packageId].quantity - 1);
        if (selectedPackages[item.packageId].quantity === 0) delete selectedPackages[item.packageId];
        syncOrderItemsFromSelections();
        renderPackageCards();
        updateSummary();
    });

    document.querySelectorAll('#qurbani-wizard input:not([data-item-name]):not([data-item-income]):not([name="qurbaniPackage"]), #qurbani-wizard select, #qurbani-wizard textarea').forEach(input => {
        input.addEventListener('input', () => {
            clearAlert();
            updateSummary();
        });
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
    renderPackageCards();
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

















