# OAuth Setup Guide

To enable "Continue with GitHub" and "Continue with Google", you need to create developer applications on both platforms. Follow these steps to get your **Client ID** and **Client Secret** for each.

## 1. GitHub OAuth Setup

1.  Log in to your GitHub account.
2.  Go to **Settings** (click your profile picture in top right).
3.  Scroll down to the bottom of the left sidebar and click **Developer settings**.
4.  Click **OAuth Apps** in the sidebar.
5.  Click the **New OAuth App** button.
6.  Fill in the form:
    *   **Application name**: `What's Next`
    *   **Homepage URL**: `https://whats-next-1.onrender.com`
    *   **Authorization callback URL**: `https://whats-next-oxdf.onrender.com/accounts/github/login/callback/`
7.  Click **Register application**.
8.  On the next page, you will see your **Client ID**. Copy it.
9.  Click **Generate a new client secret**. Copy the **Client Secret**.

## 2. Google OAuth Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Whats Next Auth") or select an existing one.
3.  In the search bar, type "OAuth consent screen" and select it.
4.  Select **External** user type and click **Create**.
5.  Fill in the App Information:
    *   **App name**: `What's Next`
    *   **User support email**: Select your email.
    *   **Developer contact information**: Enter your email.
    *   Click **Save and Continue**.
6.  Skip the "Scopes" section (defaults are fine) and click **Save and Continue**.
7.  Skip "Test Users" and click **Save and Continue**.
8.  Go to **Credentials** in the left sidebar.
9.  Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
10. Select **Web application** as the Application type.
11. Fill in the details:
    *   **Name**: `Whats Next Web Client`
    *   **Authorized JavaScript origins**:
        *   `https://whats-next-1.onrender.com`
        *   `http://localhost:5173`
    *   **Authorized redirect URIs**:
        *   `https://whats-next-oxdf.onrender.com/accounts/google/login/callback/`
12. Click **Create**.
13. A modal will appear with your **Client ID** and **Client Secret**. Copy them.

## 3. Add Credentials to Render

Once you have these keys, go to your **Render Dashboard** for the **Backend Service** (`whats-next-backend`):

1.  Click on **Environment**.
2.  Add the following environment variables:

| Key | Value |
| :--- | :--- |
| `GITHUB_CLIENT_ID` | *Paste your GitHub Client ID* |
| `GITHUB_CLIENT_SECRET` | *Paste your GitHub Client Secret* |
| `GOOGLE_CLIENT_ID` | *Paste your Google Client ID* |
| `GOOGLE_CLIENT_SECRET` | *Paste your Google Client Secret* |

3.  Click **Save Changes**. This will trigger a redeploy.
