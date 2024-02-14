<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Messages;
use App\Events\ChatEvent;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fields = $request->validate([
            'user' => ['required', 'integer'],
            'message' => ['required', 'string', 'max:5000']
        ]);

        $to_user = User::where('id', $request->user)->first();

        if($to_user) {
            event(new ChatEvent($request->message, $to_user->id, auth('sanctum')->user()->id));

            $message = Messages::create([
                'from_id' => auth('sanctum')->user()->id, 
                'to_id' => $to_user->id,
                'type' => 'text',
                'message' => $fields['message']
            ]);

            return $request->message;
        }
        else {
            return 'User not found';
        }

    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user_id = auth('sanctum')->user()->id;

        $messages = Messages::where('from_id', '=', $user_id)
                            ->Where('to_id', '=', $id)
                            ->orWhere('from_id', '=', $id)
                            ->Where('to_id', '=', $user_id)
                            ->get();

        $fMessages = [];
        foreach($messages as $msg) {
            $fMessages[] = [
                'received' => $msg->to_id == $user_id ? true : false,
                'message' => $msg->message,
            ];

        }

        return $fMessages;
    }
}
