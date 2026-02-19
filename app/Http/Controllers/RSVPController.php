<?php

namespace App\Http\Controllers;

use App\Models\GuestGroup;
use App\Models\GuestMember;
use Illuminate\Http\Request;

class RSVPController extends Controller
{
    public function submit(Request $request, GuestGroup $guestGroup)
    {
        $validated = $request->validate([
            'members' => 'required|array',
            'members.*.id' => 'required|exists:guest_members,id',
            'members.*.is_attending' => 'required|boolean',
            'members.*.menu_choice' => 'nullable|string',
            'members.*.drink_choice' => 'nullable|string',
            'members.*.allergies' => 'nullable|string',
        ]);

        foreach ($validated['members'] as $memberData) {
            $member = GuestMember::where('id', $memberData['id'])
                ->where('guest_group_id', $guestGroup->id)
                ->firstOrFail();

            $member->update([
                'is_attending' => $memberData['is_attending'],
                'menu_choice' => $memberData['menu_choice'] ?? null,
                'drink_choice' => $memberData['drink_choice'] ?? null,
                'allergies' => $memberData['allergies'] ?? null,
            ]);
        }

        // Update group status to 'confirmed'
        $guestGroup->update(['status' => 'confirmed']);

        return back()->with('success', '¡Gracias por confirmar!');
    }
}
