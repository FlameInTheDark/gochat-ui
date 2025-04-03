<script>
    import RegistrationForm from '$lib/components/RegistrationForm.svelte';
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-800">
    <div class="max-w-md w-full bg-gray-700 p-8 rounded-lg shadow-lg">
        <RegistrationForm />
        
        <div class="mt-6 text-center">
            <p class="text-sm text-gray-400">
                Already have an account? 
                <a href="/login" class="font-medium text-blue-400 hover:text-blue-300">
                    Log in
                </a>
            </p>
        </div>
    </div>
</div> 