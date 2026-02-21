<?php

namespace App\Services;

class SawService
{
    /**
     * Normalize data and calculate SAW scores.
     * 
     * @param array $candidates List of candidates with their scores
     * @param array $weights Bobot for each criterion
     * @param array $criteria List of criteria names
     * @return array Ranked candidates
     */
    public function calculate(array $candidates, array $weights, array $criteria): array
    {
        if (empty($candidates)) {
            return [];
        }

        // 1. Find max values for normalization (assuming all are benefit criteria)
        $maxValues = [];
        foreach ($criteria as $criterion) {
            $maxValues[$criterion] = collect($candidates)->max($criterion) ?: 1;
        }

        // 2. Normalization & Weighting
        $results = [];
        foreach ($candidates as $candidate) {
            $normalizedScores = [];
            $totalScore = 0;

            foreach ($criteria as $criterion) {
                // R_ij = x_ij / max(x_j)
                $normalized = $candidate[$criterion] / $maxValues[$criterion];
                $normalizedScores[$criterion] = $normalized;
                
                // V_i = sum(w_j * R_ij)
                $totalScore += ($normalized * ($weights[$criterion] ?? 0));
            }

            $results[] = [
                'candidate_name' => $candidate['name'] ?? 'Unknown',
                'criteria_scores' => array_intersect_key($candidate, array_flip($criteria)),
                'final_score' => round($totalScore, 4),
            ];
        }

        // 3. Sorting and Ranking
        usort($results, function ($a, $b) {
            return $b['final_score'] <=> $a['final_score'];
        });

        foreach ($results as $index => &$result) {
            $result['ranking'] = $index + 1;
        }

        return $results;
    }

    /**
     * Validate CSV structure.
     * 
     * @param array $header
     * @param array $required
     * @return bool
     */
    public function validateHeader(array $header, array $required): bool
    {
        foreach ($required as $req) {
            if (!in_array($req, $header)) {
                return false;
            }
        }
        return true;
    }
}
