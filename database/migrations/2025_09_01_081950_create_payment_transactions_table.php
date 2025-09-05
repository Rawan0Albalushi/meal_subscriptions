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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('payment_session_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('OMR');
            $table->string('gateway_name');
            $table->string('gateway_transaction_id')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->json('gateway_response');
            $table->timestamps();
            
            $table->foreign('payment_session_id')->references('id')->on('payment_sessions')->onDelete('cascade');
            $table->index('payment_session_id');
            $table->index(['model_type', 'model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
