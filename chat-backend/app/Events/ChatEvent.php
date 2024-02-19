<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    private $message;
    private $rec_id;
    private $from_id;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($message, $rec_id, $from_id)
    {
        $this->message = $message;
        $this->rec_id = $rec_id;
        $this->from_id = $from_id;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('private.chat.'.$this->rec_id);
    }

    public function broadcastAs()
    {
        return 'chat';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message->only(['from_id', 'to_id', 'message', 'type', 'created_at'])
        ];
    }
}
