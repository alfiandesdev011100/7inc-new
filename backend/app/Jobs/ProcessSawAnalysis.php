<?php

namespace App\Jobs;

use App\Models\SawAnalysisResult;
use App\Services\SawService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessSawAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $candidates;
    protected $weights;
    protected $criteria;
    protected $sessionId;
    protected $adminId;

    /**
     * Create a new job instance.
     */
    public function __construct(array $candidates, array $weights, array $criteria, string $sessionId, int $adminId)
    {
        $this->candidates = $candidates;
        $this->weights = $weights;
        $this->criteria = $criteria;
        $this->sessionId = $sessionId;
        $this->adminId = $adminId;
    }

    /**
     * Execute the job.
     */
    public function handle(SawService $sawService): void
    {
        Log::info("Starting SAW Analysis for Session: {$this->sessionId}");

        try {
            $rankedData = $sawService->calculate($this->candidates, $this->weights, $this->criteria);

            DB::beginTransaction();
            foreach ($rankedData as $item) {
                SawAnalysisResult::create([
                    'session_id' => $this->sessionId,
                    'candidate_name' => $item['candidate_name'],
                    'criteria_scores' => $item['criteria_scores'],
                    'final_score' => $item['final_score'],
                    'ranking' => $item['ranking'],
                    'admin_id' => $this->adminId,
                ]);
            }
            DB::commit();

            Log::info("SAW Analysis Completed for Session: {$this->sessionId}");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("SAW Analysis Failed: " . $e->getMessage());
            throw $e;
        }
    }
}
