# FRD 2: Authentication System

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| /login | GET | Public | Login page |
| /signup | GET | Public | Signup choice page |
| /signup/parent | GET | Public | Parent signup (redirects to camp registration) |
| /signup/academy | GET | Public | Academy signup form |
| /forgot-password | GET | Public | Request password reset |
| /reset-password | GET | Public | Reset password form (with token) |
| /auth/callback | GET | Public | Supabase auth callback handler |
| /auth/confirm | GET | Public | Email confirmation handler |

## Components

### LoginForm
```typescript
interface LoginFormProps {
  redirectTo?: string; // Where to redirect after login
}

// Fields
- email: string (required, email format)
- password: string (required)

// Actions
- onSubmit: Call supabase.auth.signInWithPassword()
- onForgotPassword: Navigate to /forgot-password

// States
- idle, loading, error, success
```

### SignupChoicePage
```typescript
// Two CTAs:
// "I'm a parent" → /signup/parent (or directly to camp registration)
// "I run an academy" → /signup/academy
```

### AcademySignupForm
```typescript
// Fields
- orgName: string (required)
- fullName: string (required)
- email: string (required, email format)
- phone: string (optional)
- password: string (required, 12+ chars with complexity)
- confirmPassword: string (required, must match)

// Actions
- onSubmit:
  1. Create auth user with metadata: { full_name, roles: ['org_owner'] }
  2. Trigger creates profile
  3. Create organization
  4. Update profile with organization_id
  5. Redirect to email confirmation

// Validation
- Password: min 12 chars, upper, lower, digit, symbol
- Email: valid format, unique
```

### ForgotPasswordForm
```typescript
// Fields
- email: string (required)

// Actions
- onSubmit: Call supabase.auth.resetPasswordForEmail()
- Show success message regardless of email existence (security)
```

### ResetPasswordForm
```typescript
// URL params: token (from email link)

// Fields
- password: string (required, 12+ chars with complexity)
- confirmPassword: string (required, must match)

// Actions
- onSubmit: Call supabase.auth.updateUser({ password })
- Redirect to /login with success message
```

## Middleware Logic

```typescript
// src/middleware.ts

const publicRoutes = ['/', '/camps', '/login', '/signup', '/forgot-password', '/reset-password', '/auth'];
const parentRoutes = ['/dashboard'];
const adminRoutes = ['/organizer'];

export async function middleware(req: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  // Public routes - allow all
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // No session - redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Get profile for role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', session.user.id)
    .single();

  // Admin routes - require org_admin or org_owner
  if (path.startsWith('/organizer')) {
    const isAdmin = profile?.roles?.includes('org_admin') || profile?.roles?.includes('org_owner');
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Parent routes - any authenticated user
  if (path.startsWith('/dashboard')) {
    // Allow - parents and admins can both access
  }

  return NextResponse.next();
}
```

## Auth Callback Handler

```typescript
// src/app/auth/callback/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user.id)
        .single();

      // Redirect based on role
      if (profile?.roles?.includes('org_owner') || profile?.roles?.includes('org_admin')) {
        return NextResponse.redirect(new URL('/organizer', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Error - redirect to login
  return NextResponse.redirect(new URL('/login?error=auth', request.url));
}
```
