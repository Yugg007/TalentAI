package com.talent.ai.core.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.talent.ai.core.dto.ATSTask;
import com.talent.ai.core.dto.ATSTaskResponse;
import com.talent.ai.core.repository.AtsRepository;

class AtsServiceTest {

	private final AtsRepository repository = mock(AtsRepository.class);
	private final AtsService service = new AtsService(repository);

	@Test
	void returnsWorkerResultAndStatusForTaskSummary() {
		Map<String, Object> atsResult = Map.of("overall_fit_score", 84.5);
		ATSTask task = new ATSTask("candidate", "private resume", "private role", "hash", "COMPLETED");
		task.setId("task-1");
		task.setResult(Map.of("ats_result", atsResult));
		when(repository.findById("task-1")).thenReturn(Optional.of(task));

		ATSTaskResponse response = service.getTaskSummary("task-1", "candidate");

		assertEquals("task-1", response.getTaskId());
		assertEquals("COMPLETED", response.getStatus());
		assertEquals(Map.of("ats_result", atsResult), response.getResult());
		assertNull(response.getError());
	}

	@Test
	void returnsNullWhenTaskDoesNotExist() {
		when(repository.findById("missing")).thenReturn(Optional.empty());

		assertNull(service.getTaskSummary("missing", "candidate"));
	}

	@Test
	void doesNotReturnAnotherUsersTaskSummary() {
		ATSTask task = new ATSTask("another-candidate", "private resume", "private role", "hash", "COMPLETED");
		task.setId("task-2");
		when(repository.findById("task-2")).thenReturn(Optional.of(task));

		assertNull(service.getTaskSummary("task-2", "candidate"));
	}
}