package com.talent.ai.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.talent.ai.model.MasterData;
import com.talent.ai.repository.PersonInfoRepository;
import com.talent.ai.repository.UserRepository;

@Component
public class MasterDataLoader {
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PersonInfoRepository personInfoRepository;
	
	@Autowired
	private MasterData masterData;
	
    @EventListener(ApplicationReadyEvent.class)
    public void loadMasterData() {
    	loadConfiguration();
    }
    
    public void loadConfiguration() {
    	try {
    		masterData.loadUserIntoCache(userRepository.findAll());
		} catch (Exception e) {
			// TODO: handle exception
		}
    	
    	try {
    		masterData.loadPersonInfoIntoCache(personInfoRepository.findAll());
		} catch (Exception e) {
			// TODO: handle exception
		} 
    }

}
