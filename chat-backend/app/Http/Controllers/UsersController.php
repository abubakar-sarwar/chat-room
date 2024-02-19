<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Messages;

use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use Illuminate\Support\Facades\Storage;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = User::all();

        // Loop through each user
        foreach ($users as $user) {
            // Retrieve the last message sent to or received from the user
            $lastMessage = Messages::select('from_id', 'message', 'type', 'created_at')
                ->where('from_id', $user->id)
                ->orWhere('to_id', $user->id)
                ->latest() // Get the latest message
                ->first(); // Retrieve only the first result

            // Add the last message to the user object
            $user->lastMessage = $lastMessage;
        }

        // Return the users with the last message added
        return $users;
    }

    public function register(Request $request) {
        $fields = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','string','unique:users','email', 'max:255'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                        ->letters()
                        ->mixedCase()
                        ->numbers()
                        ->symbols()
                        ->uncompromised(),
                'max:255'
            ]
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => bcrypt($fields['password'])
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        $user['avatar'] = '/static/media/' . $user['avatar'];
        $user['accessToken'] = $token;

        return response($user, 201);
    }

    public function login(Request $request) {
        $fields = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255']
        ]);

        // CHECK EMAIL
        $user = User::where('email', $fields['email'])->first();

        if(!$user)
        {
            return response([
                'errors' => ['email' => ['Email or Password is invalid.']]
            ], 203);
        }

        if(!$user || !Hash::check($fields['password'], $user->password)) {
            return response([
                'errors' => ['password' => ['Wrong password.']]
            ], 203);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        $user['avatar'] = '/static/media/' . $user['avatar'];
        $user['accessToken'] = $token;

        return response($user, 201);
    }

    public function logout(Request $request) {
        $request->user()->tokens()->delete();

        return [
            'messange' => 'Logged out.'
        ];
    }
}
