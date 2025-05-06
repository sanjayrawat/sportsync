// User Authentication
const users = [];

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Simulate login (in real app, this would be an API call)
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

// Add event listeners for form interactions
document.addEventListener('DOMContentLoaded', () => {
    const userTypeSelect = document.getElementById('user-type');
    const cricketFields = document.getElementById('cricket-fields');

    // Handle user type selection
    if (userTypeSelect && cricketFields) {
        // Initial check
        const isCricketUser = userTypeSelect.value === 'cricket-player' || 
                            userTypeSelect.value === 'cricket-coach' || 
                            userTypeSelect.value === 'cricket-academy';
        cricketFields.classList.toggle('hidden', !isCricketUser);

        // Change event listener
        userTypeSelect.addEventListener('change', (e) => {
            console.log('User type changed:', e.target.value);
            const isCricketUser = e.target.value === 'cricket-player' || 
                                e.target.value === 'cricket-coach' || 
                                e.target.value === 'cricket-academy';
            
            if (isCricketUser) {
                cricketFields.classList.remove('hidden');
                // Reset cricket-specific form fields
                if (document.getElementById('cricket-role')) {
                    document.getElementById('cricket-role').value = '';
                }
                if (document.getElementById('cricket-level')) {
                    document.getElementById('cricket-level').value = '';
                }
                // Uncheck all checkboxes
                document.querySelectorAll('input[name="format"], input[name="equipment"]')
                    .forEach(checkbox => checkbox.checked = false);
            } else {
                cricketFields.classList.add('hidden');
            }
        });

        // Add validation for cricket fields
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                const userType = userTypeSelect.value;
                const isCricketUser = userType === 'cricket-player' || 
                                    userType === 'cricket-coach' || 
                                    userType === 'cricket-academy';

                if (isCricketUser) {
                    const role = document.getElementById('cricket-role')?.value;
                    const level = document.getElementById('cricket-level')?.value;
                    const formats = document.querySelectorAll('input[name="format"]:checked');

                    if (!role || !level) {
                        e.preventDefault();
                        showNotification('Please fill in all cricket-specific details', 'error');
                        return;
                    }

                    if (formats.length === 0) {
                        e.preventDefault();
                        showNotification('Please select at least one preferred format', 'error');
                        return;
                    }
                }
            });
        }
    }

    // Handle equipment checkboxes
    const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]');
    equipmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Equipment selected:', checkbox.value, checkbox.checked);
        });
    });

    // Handle format checkboxes
    const formatCheckboxes = document.querySelectorAll('input[name="format"]');
    formatCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Format selected:', checkbox.value, checkbox.checked);
        });
    });

    // Log when cricket role or level changes
    const cricketRole = document.getElementById('cricket-role');
    const cricketLevel = document.getElementById('cricket-level');

    if (cricketRole) {
        cricketRole.addEventListener('change', (e) => {
            console.log('Cricket role selected:', e.target.value);
        });
    }

    if (cricketLevel) {
        cricketLevel.addEventListener('change', (e) => {
            console.log('Cricket level selected:', e.target.value);
        });
    }
});

function handleRegistration(event) {
    event.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const userType = document.getElementById('user-type').value;
    const terms = document.getElementById('terms').checked;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (!terms) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }

    // Create new user object
    const newUser = {
        id: users.length + 1,
        firstName,
        lastName,
        email,
        phone,
        password,
        userType,
        createdAt: new Date()
    };

    // Add cricket-specific details if user is a cricket player/coach/academy
    if (userType.startsWith('cricket-')) {
        const cricketRole = document.getElementById('cricket-role').value;
        const cricketLevel = document.getElementById('cricket-level').value;
        
        // Get selected formats
        const formatInputs = document.querySelectorAll('input[name="format"]:checked');
        const formats = Array.from(formatInputs).map(input => input.value);
        
        // Get selected equipment
        const equipmentInputs = document.querySelectorAll('input[name="equipment"]:checked');
        const equipment = Array.from(equipmentInputs).map(input => input.value);

        // Validate cricket-specific fields
        if (!cricketRole || !cricketLevel) {
            showNotification('Please fill in all cricket-specific details', 'error');
            return;
        }

        if (formats.length === 0) {
            showNotification('Please select at least one preferred format', 'error');
            return;
        }

        // Add cricket details to user object
        newUser.cricketDetails = {
            role: cricketRole,
            level: cricketLevel,
            formats,
            equipment
        };
    }

    users.push(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.href = 'dashboard.html';
}

// Booking System
let selectedFacility = null;
let selectedDate = null;
let selectedTimeSlot = null;

function selectFacility(facility) {
    selectedFacility = facility;
    document.querySelectorAll('.facility-option').forEach(el => {
        el.classList.remove('border-indigo-500', 'bg-indigo-50');
    });
    document.querySelector(`#${facility}`).classList.add('border-indigo-500', 'bg-indigo-50');
    
    // Show/hide cricket equipment section
    const cricketEquipment = document.getElementById('cricket-equipment');
    if (cricketEquipment) {
        cricketEquipment.classList.toggle('hidden', facility !== 'cricket');
    }
    
    updateBookingSummary();
}

function selectTimeSlot(time) {
    selectedTimeSlot = time;
    document.querySelectorAll('.time-slot').forEach(el => {
        el.classList.remove('border-indigo-500', 'bg-indigo-50');
    });
    document.querySelector(`#time-${time}`).classList.add('border-indigo-500', 'bg-indigo-50');
    updateBookingSummary();
}

function handleDateChange(event) {
    selectedDate = event.target.value;
    updateBookingSummary();
}

function updateBookingSummary() {
    const summary = document.getElementById('booking-summary');
    if (!summary) return;

    if (selectedFacility && selectedDate && selectedTimeSlot) {
        const basePrice = {
            'football': 1000,
            'cricket': 1500,
            'tennis': 800
        }[selectedFacility];

        let equipmentCharges = 0;
        let equipmentDetails = [];

        // Calculate cricket equipment charges
        if (selectedFacility === 'cricket') {
            const equipmentPrices = {
                'bowling-machine': 500,
                'cricket-kit': 300,
                'practice-nets': 200
            };

            document.querySelectorAll('input[name="equipment"]:checked').forEach(equipment => {
                const charge = equipmentPrices[equipment.value];
                equipmentCharges += charge;
                equipmentDetails.push(`
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">${equipment.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                        <span class="font-medium">₹${charge}</span>
                    </div>
                `);
            });
        }

        const subtotal = basePrice + equipmentCharges;
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        summary.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="text-gray-600">Facility Charges</span>
                <span class="font-medium">₹${basePrice}</span>
            </div>
            ${equipmentDetails.join('')}
            ${equipmentCharges > 0 ? `
                <div class="flex justify-between mb-2 pt-2 border-t">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium">₹${subtotal}</span>
                </div>
            ` : ''}
            <div class="flex justify-between mb-2">
                <span class="text-gray-600">GST (18%)</span>
                <span class="font-medium">₹${gst}</span>
            </div>
            <div class="flex justify-between pt-2 border-t">
                <span class="font-medium">Total Amount</span>
                <span class="font-bold text-indigo-600">₹${total}</span>
            </div>
        `;
    }
}

// Add event listeners for equipment selection
document.addEventListener('DOMContentLoaded', () => {
    const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]');
    equipmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBookingSummary);
    });
});

function handleBooking(event) {
    event.preventDefault();

    if (!selectedFacility || !selectedDate || !selectedTimeSlot) {
        showNotification('Please select all booking details', 'error');
        return;
    }

    const booking = {
        id: Date.now(),
        facility: selectedFacility,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        userId: JSON.parse(localStorage.getItem('currentUser')).id,
        status: 'confirmed'
    };

    // Save booking
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    showNotification('Booking confirmed successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Academy Management
function createBatch(event) {
    event.preventDefault();
    const batchName = document.getElementById('batch-name').value;
    const level = document.getElementById('batch-level').value;
    const trainingType = document.getElementById('training-type')?.value;
    const schedule = document.getElementById('batch-schedule').value;
    const maxPlayers = document.getElementById('max-players').value;
    
    // Get selected equipment
    const equipmentInputs = document.querySelectorAll('input[name="equipment"]:checked');
    const equipment = Array.from(equipmentInputs).map(input => input.value);

    if (!batchName || !level || !schedule || !maxPlayers) {
        showNotification('Please fill in all batch details', 'error');
        return;
    }

    // Additional validation for cricket batches
    if (level.startsWith('Cricket-') && !trainingType) {
        showNotification('Please select a training type for cricket batch', 'error');
        return;
    }

    const batch = {
        id: Date.now(),
        name: batchName,
        level,
        trainingType,
        schedule,
        equipment,
        maxPlayers: parseInt(maxPlayers),
        currentPlayers: 0,
        academyId: JSON.parse(localStorage.getItem('currentUser')).academyId,
        sport: level.startsWith('Cricket-') ? 'Cricket' : 'General'
    };

    // Save batch
    const batches = JSON.parse(localStorage.getItem('batches') || '[]');
    batches.push(batch);
    localStorage.setItem('batches', JSON.stringify(batches));

    showNotification('Batch created successfully!', 'success');
    loadBatches();
}

function loadBatches() {
    const batches = JSON.parse(localStorage.getItem('batches') || '[]');
    const batchesContainer = document.getElementById('batches-container');
    if (!batchesContainer) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const academyBatches = batches.filter(b => b.academyId === currentUser.academyId);

    batchesContainer.innerHTML = academyBatches.map(batch => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${batch.name}</div>
                ${batch.sport === 'Cricket' ? `
                    <div class="text-xs text-gray-500">${batch.trainingType}</div>
                ` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    batch.sport === 'Cricket' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }">
                    ${batch.level}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${batch.schedule}</div>
                ${batch.equipment && batch.equipment.length > 0 ? `
                    <div class="text-xs text-gray-500">
                        Required: ${batch.equipment.join(', ')}
                    </div>
                ` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${batch.currentPlayers}/${batch.maxPlayers}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editBatch(${batch.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                <button onclick="deleteBatch(${batch.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Handle training type visibility based on selected level
document.addEventListener('DOMContentLoaded', () => {
    const batchLevelSelect = document.getElementById('batch-level');
    const trainingTypeDiv = document.getElementById('training-type')?.closest('div');
    const equipmentDiv = document.getElementById('equipment')?.closest('div');

    if (batchLevelSelect && trainingTypeDiv && equipmentDiv) {
        batchLevelSelect.addEventListener('change', (e) => {
            const isCricket = e.target.value.startsWith('Cricket-');
            trainingTypeDiv.style.display = isCricket ? 'block' : 'none';
            equipmentDiv.style.display = isCricket ? 'block' : 'none';
        });

        // Initial state
        const isCricket = batchLevelSelect.value.startsWith('Cricket-');
        trainingTypeDiv.style.display = isCricket ? 'block' : 'none';
        equipmentDiv.style.display = isCricket ? 'block' : 'none';
    }
});

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners based on current page
    const loginForm = document.querySelector('form[action="#"]');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }

    // Load data if on relevant pages
    if (window.location.pathname.includes('academy.html')) {
        loadBatches();
    }

    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && !window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }
});
