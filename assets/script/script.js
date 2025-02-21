document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${targetPage}-page`).classList.add('active');
        });
    });

    // Profile editing
    const profileForm = document.getElementById('profile-form');
    const editProfileBtn = document.getElementById('edit-profile');
    const saveProfileBtn = document.getElementById('save-profile');
    const cancelEditBtn = document.getElementById('cancel-edit');

    let originalProfileData = {};

    editProfileBtn.addEventListener('click', function() {
        // Store original data
        originalProfileData = {
            name: profileForm.name.value,
            email: profileForm.email.value,
            phone: profileForm.phone.value,
            // bio: profileForm.bio.value
        };

        // Enable form fields
        profileForm.querySelectorAll('input, textarea').forEach(field => field.disabled = false);

        // Show/hide buttons
        editProfileBtn.style.display = 'none';
        saveProfileBtn.style.display = 'inline-block';
        cancelEditBtn.style.display = 'inline-block';
    });

    saveProfileBtn.addEventListener('click', function() {
        // Here you would typically send the data to a server
        console.log('Profile saved:', {
            name: profileForm.name.value,
            email: profileForm.email.value,
            phone: profileForm.phone.value,
            // bio: profileForm.bio.value
        });

        // Disable form fields
        profileForm.querySelectorAll('input, textarea').forEach(field => field.disabled = true);

        // Show/hide buttons
        editProfileBtn.style.display = 'inline-block';
        saveProfileBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    });

    cancelEditBtn.addEventListener('click', function() {
        // Restore original data
        profileForm.name.value = originalProfileData.name;
        profileForm.email.value = originalProfileData.email;
        profileForm.phone.value = originalProfileData.phone;
        // profileForm.bio.value = originalProfileData.bio;

        // Disable form fields
        profileForm.querySelectorAll('input, textarea').forEach(field => field.disabled = true);

        // Show/hide buttons
        editProfileBtn.style.display = 'inline-block';
        saveProfileBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    });

});