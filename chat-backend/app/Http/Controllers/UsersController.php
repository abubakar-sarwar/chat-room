<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;

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
        return User::all();
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

        $response = [
            'user' => $user,
            'token' => $token
        ];

        return response($response, 201);
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
