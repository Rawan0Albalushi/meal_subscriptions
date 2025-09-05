<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_sessions', function (Blueprint $table) {
            $table->string('id')->primary(); // Gateway session ID
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->string('gateway_name');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('OMR');
            $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->text('payment_link');
            $table->json('gateway_data');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index(['model_type', 'model_id']);
            $table->index('user_id');
            $table->index('gateway_name');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_sessions');
    }
};
